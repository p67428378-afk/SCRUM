from datetime import timedelta
from server.models import ExportJob, get_utc_now
from server.services.encryption import encrypt_data, decrypt_data
from server.services.storage import upload_to_gcs
from server.services.exporter import enforce_retention_policy


def test_encryption_decryption():
    """Test that encryption and decryption work correctly and preserve data."""
    original_data = b"Hello, this is a highly sensitive audit log!"
    encrypted = encrypt_data(original_data)
    assert encrypted != original_data

    decrypted = decrypt_data(encrypted)
    assert decrypted == original_data


def test_storage_upload():
    """Test that storage upload works in testing mode (writes to /tmp/mock_gcs)."""
    test_data = b"Encrypted audit log content"
    file_name = "test_audit_log.csv.enc"
    bucket_name = "test-bucket"

    success = upload_to_gcs(bucket_name, file_name, test_data)
    assert success is True


def test_trigger_endpoint(client, db_session):
    """Test that triggering an export job returns 202 and creates a job record."""
    # Clear existing jobs to have a clean state
    db_session.query(ExportJob).delete()
    db_session.commit()

    response = client.post("/api/v1/exports/trigger")
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["message"] == "Audit log export process initiated successfully."

    # Verify job was created in DB
    job = db_session.query(ExportJob).filter(ExportJob.id == data["job_id"]).first()
    assert job is not None
    assert job.status in ("IN_PROGRESS", "SUCCESS")


def test_trigger_conflict(client, db_session):
    """Test that triggering an export when one is already in progress returns 409."""
    # Create an active in-progress job
    active_job = ExportJob(
        id="active-job-uuid", status="IN_PROGRESS", started_at=get_utc_now()
    )
    db_session.add(active_job)
    db_session.commit()

    response = client.post("/api/v1/exports/trigger")
    assert response.status_code == 409
    assert response.json()["detail"] == "An export job is already in progress."


def test_status_endpoint(client, db_session):
    """Test that the status endpoint returns the correct structure and history."""
    # Clear existing jobs
    db_session.query(ExportJob).delete()
    db_session.commit()

    # Add a successful job
    success_job = ExportJob(
        id="success-job-uuid",
        status="SUCCESS",
        started_at=get_utc_now() - timedelta(hours=2),
        completed_at=get_utc_now() - timedelta(hours=1, minutes=55),
        exported_file_name="audit_log_test.csv.enc",
        exported_file_size_bytes=1024 * 1024 * 5,  # 5 MB
        details="Uploaded successfully.",
    )
    db_session.add(success_job)
    db_session.commit()

    response = client.get("/api/v1/exports/status")
    assert response.status_code == 200
    data = response.json()

    assert "last_run" in data
    assert data["last_run"]["job_id"] == "success-job-uuid"
    assert data["last_run"]["status"] == "SUCCESS"
    assert data["last_run"]["file_size_mb"] == 5.0

    assert "next_run_scheduled_at" in data
    assert "history" in data
    assert len(data["history"]) == 1
    assert data["history"][0]["job_id"] == "success-job-uuid"


def test_config_endpoint(client):
    """Test that the config endpoint returns the correct configuration settings."""
    response = client.get("/api/v1/exports/config")
    assert response.status_code == 200
    data = response.json()
    assert data["encryption_standard"] == "AES-256"
    assert data["retention_days"] == 2555
    assert data["schedule_cron"] == "0 1 * * *"


def test_update_config_endpoint(client):
    """Test that updating the config works correctly."""
    payload = {"gcs_bucket_name": "new-custom-bucket", "retention_days": 365}
    response = client.put("/api/v1/exports/config", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gcs_bucket_name"] == "new-custom-bucket"
    assert data["retention_days"] == 365


def test_retention_policy(db_session):
    """Test that the retention policy correctly deletes records older than 7 years."""
    # Clear existing jobs
    db_session.query(ExportJob).delete()
    db_session.commit()

    # Add a job that is 8 years old
    old_job = ExportJob(
        id="old-job-uuid",
        status="SUCCESS",
        started_at=get_utc_now() - timedelta(days=365 * 8),
        completed_at=get_utc_now() - timedelta(days=365 * 8),
    )
    # Add a job that is 1 day old
    new_job = ExportJob(
        id="new-job-uuid",
        status="SUCCESS",
        started_at=get_utc_now() - timedelta(days=1),
        completed_at=get_utc_now() - timedelta(days=1),
    )
    db_session.add(old_job)
    db_session.add(new_job)
    db_session.commit()

    deleted = enforce_retention_policy(db_session)
    assert deleted == 1

    # Verify only the new job remains
    jobs = db_session.query(ExportJob).all()
    assert len(jobs) == 1
    assert jobs[0].id == "new-job-uuid"


def test_dry_run_endpoint(client):
    """Test that the dry-run endpoint returns 200 and correct response structure."""
    response = client.post("/api/v1/admin/audits/export/dry-run")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Dry-run successful. No data was exported."
    assert data["entries_processed"] == 3


def test_dry_run_unauthorized(client, monkeypatch):
    """Test that the dry-run endpoint returns 403 when unauthorized and not in testing mode."""
    from server.config import settings

    monkeypatch.setattr(settings, "TESTING", False)

    # Without header
    response = client.post("/api/v1/admin/audits/export/dry-run")
    assert response.status_code == 403
    assert "Admin access denied" in response.json()["detail"]

    # With invalid header
    response = client.post(
        "/api/v1/admin/audits/export/dry-run", headers={"X-Admin-Token": "wrong-token"}
    )
    assert response.status_code == 403

    # With valid header
    response = client.post(
        "/api/v1/admin/audits/export/dry-run",
        headers={"X-Admin-Token": "admin-secret-token"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"
