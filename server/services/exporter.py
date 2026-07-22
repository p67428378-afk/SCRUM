import logging
from datetime import timedelta
from sqlalchemy.orm import Session
from server.models import ExportJob, get_utc_now
from server.config import settings
from server.services.encryption import encrypt_data
from server.services.storage import upload_to_gcs

logger = logging.getLogger("securelog.exporter")


def generate_mock_audit_logs() -> bytes:
    """
    Generates mock audit logs in CSV format.
    In a real system, this would query the database or read log files.
    """
    import csv
    import io

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        ["timestamp", "user_id", "action", "status", "ip_address", "details"]
    )

    now = get_utc_now()
    writer.writerow(
        [
            (now - timedelta(minutes=10)).isoformat(),
            "user_123",
            "LOGIN",
            "SUCCESS",
            "192.168.1.1",
            "User logged in successfully",
        ]
    )
    writer.writerow(
        [
            (now - timedelta(minutes=8)).isoformat(),
            "user_123",
            "VIEW_SENSITIVE_DATA",
            "SUCCESS",
            "192.168.1.1",
            "User viewed compliance report",
        ]
    )
    writer.writerow(
        [
            (now - timedelta(minutes=5)).isoformat(),
            "user_456",
            "DELETE_RECORD",
            "FAILED",
            "10.0.0.5",
            "Unauthorized attempt to delete audit log",
        ]
    )

    return output.getvalue().encode("utf-8")


def enforce_retention_policy(db: Session) -> int:
    """
    Enforces the 7-year data retention policy on the database.
    Deletes export job records older than 2555 days (7 years).
    Returns the number of deleted records.
    """
    retention_limit = get_utc_now() - timedelta(days=2555)
    logger.info(
        f"Enforcing retention policy: deleting database records older than {retention_limit.isoformat()}"
    )

    deleted_count = (
        db.query(ExportJob).filter(ExportJob.started_at < retention_limit).delete()
    )
    try:
        db.commit()
        logger.info(
            f"Retention policy enforced: deleted {deleted_count} old export job records."
        )
        return deleted_count
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to enforce retention policy: {str(e)}")
        return 0


def run_export_job(db: Session, job_id: str) -> None:
    """
    Executes the audit log export workflow:
    1. Generates/collects audit logs.
    2. Encrypts the logs using AES-256.
    3. Uploads the encrypted file to GCS.
    4. Enforces the 7-year retention policy on the database.
    5. Updates the job status in the database.
    """
    job = db.query(ExportJob).filter(ExportJob.id == job_id).first()
    if not job:
        logger.error(f"Job {job_id} not found in database.")
        return

    try:
        logger.info(f"Starting export job {job_id}")

        # 1. Collect logs
        logs_data = generate_mock_audit_logs()

        # 2. Encrypt logs
        encrypted_data = encrypt_data(logs_data)

        # 3. Upload to GCS
        file_name = f"audit_log_{get_utc_now().strftime('%Y-%m-%d_%H%M%S')}.csv.enc"
        bucket_name = settings.GCS_BUCKET_NAME

        upload_success = upload_to_gcs(bucket_name, file_name, encrypted_data)

        if upload_success:
            job.status = "SUCCESS"
            job.exported_file_name = file_name
            job.exported_file_size_bytes = len(encrypted_data)
            job.details = "Uploaded successfully."

            # 4. Enforce retention policy
            enforce_retention_policy(db)
        else:
            raise Exception("Upload to GCS returned False.")

    except Exception as e:
        logger.error(f"Export job {job_id} failed: {str(e)}")
        job.status = "FAILED"
        job.details = str(e)

    finally:
        job.completed_at = get_utc_now()
        job.updated_at = get_utc_now()
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to commit job status update: {str(e)}")
