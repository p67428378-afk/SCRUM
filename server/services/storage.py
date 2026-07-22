import os
import logging
from server.config import settings

logger = logging.getLogger("securelog.storage")


def upload_to_gcs(bucket_name: str, file_name: str, data: bytes) -> bool:
    """
    Uploads encrypted data to a GCS bucket.
    Falls back to local file storage if in testing mode or if credentials are missing.
    """
    # Check if we should use mock storage
    is_testing = settings.TESTING or os.getenv("TESTING") == "true"

    if is_testing:
        logger.info(
            f"[MOCK GCS] Uploading {file_name} to bucket {bucket_name} (size: {len(data)} bytes)"
        )
        # Write to a local mock directory for verification in tests
        mock_dir = "/tmp/mock_gcs"
        os.makedirs(mock_dir, exist_ok=True)
        with open(os.path.join(mock_dir, file_name), "wb") as f:
            f.write(data)
        return True

    try:
        from google.cloud import storage
        from google.auth.exceptions import DefaultCredentialsError

        try:
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(file_name)
            blob.upload_from_string(data, content_type="application/octet-stream")
            logger.info(
                f"Successfully uploaded {file_name} to GCS bucket {bucket_name}"
            )
            return True
        except DefaultCredentialsError:
            logger.warning(
                "GCP credentials not found. Falling back to local mock storage."
            )
            mock_dir = "/tmp/mock_gcs"
            os.makedirs(mock_dir, exist_ok=True)
            with open(os.path.join(mock_dir, file_name), "wb") as f:
                f.write(data)
            return True
    except Exception as e:
        logger.error(f"Failed to upload to GCS: {str(e)}")
        raise e


def delete_from_gcs(bucket_name: str, file_name: str) -> bool:
    """
    Deletes a file from a GCS bucket.
    Falls back to local file storage if in testing mode or if credentials are missing.
    """
    is_testing = settings.TESTING or os.getenv("TESTING") == "true"

    if is_testing:
        logger.info(f"[MOCK GCS] Deleting {file_name} from bucket {bucket_name}")
        mock_file_path = os.path.join("/tmp/mock_gcs", file_name)
        if os.path.exists(mock_file_path):
            os.remove(mock_file_path)
        return True

    try:
        from google.cloud import storage
        from google.auth.exceptions import DefaultCredentialsError

        try:
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(file_name)
            if blob.exists():
                blob.delete()
                logger.info(
                    f"Successfully deleted {file_name} from GCS bucket {bucket_name}"
                )
            return True
        except DefaultCredentialsError:
            logger.warning(
                "GCP credentials not found. Falling back to local mock storage deletion."
            )
            mock_file_path = os.path.join("/tmp/mock_gcs", file_name)
            if os.path.exists(mock_file_path):
                os.remove(mock_file_path)
            return True
    except Exception as e:
        logger.error(f"Failed to delete from GCS: {str(e)}")
        return False
