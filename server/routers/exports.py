import uuid
from datetime import datetime, time, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Header
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import ExportJob, get_utc_now
from server.schemas import (
    TriggerResponse,
    StatusResponse,
    LastRunInfo,
    HistoryItem,
    ConfigResponse,
    UpdateConfigSchema,
)
from server.services.exporter import run_export_job
from server.config import settings

router = APIRouter(prefix="/api/v1/exports", tags=["exports"])

# In-memory storage for dynamic configuration overrides
dynamic_config = {
    "gcs_bucket_name": settings.GCS_BUCKET_NAME,
    "encryption_standard": "AES-256",
    "retention_days": 2555,  # 7 years
    "schedule_cron": "0 1 * * *",  # Daily at 01:00 UTC
}


def verify_admin(x_admin_token: Optional[str] = Header(None)):
    """
    Simple admin verification dependency.
    In production, this would decode a JWT and check roles.
    """
    if settings.TESTING:
        return True
    # Allow a default admin token for ease of testing/frontend integration
    if not x_admin_token or x_admin_token != "admin-secret-token":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access denied. Invalid or missing X-Admin-Token header.",
        )
    return True


def get_next_run_scheduled_at() -> datetime:
    """Calculates the next scheduled run time at 01:00 UTC."""
    now = get_utc_now()
    scheduled_today = datetime.combine(now.date(), time(1, 0))
    if now >= scheduled_today:
        return scheduled_today + timedelta(days=1)
    return scheduled_today


@router.post(
    "/trigger", response_model=TriggerResponse, status_code=status.HTTP_202_ACCEPTED
)
def trigger_export(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin),
):
    """
    Manually triggers the audit log export process.
    Returns 409 Conflict if an export job is already in progress.
    """
    # Check if there is an active job in progress
    # We consider a job active if it's in 'IN_PROGRESS' status and started within the last hour
    one_hour_ago = get_utc_now() - timedelta(hours=1)
    active_job = (
        db.query(ExportJob)
        .filter(ExportJob.status == "IN_PROGRESS", ExportJob.started_at >= one_hour_ago)
        .first()
    )

    if active_job:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An export job is already in progress.",
        )

    # Create a new job record
    job_id = str(uuid.uuid4())
    new_job = ExportJob(id=job_id, status="IN_PROGRESS", started_at=get_utc_now())
    db.add(new_job)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create export job record: {str(e)}",
        )

    # Trigger the background task
    background_tasks.add_task(run_export_job, db, job_id)

    return TriggerResponse(
        message="Audit log export process initiated successfully.", job_id=job_id
    )


@router.get("/status", response_model=StatusResponse)
def get_export_status(db: Session = Depends(get_db)):
    """
    Retrieves the status and history of the export jobs.
    """
    # Get all jobs ordered by started_at descending
    jobs = db.query(ExportJob).order_by(ExportJob.started_at.desc()).all()

    # Find the last completed or successful run
    last_run = None
    success_jobs = [j for j in jobs if j.status == "SUCCESS"]
    if success_jobs:
        latest_success = success_jobs[0]
        file_size_mb = None
        if latest_success.exported_file_size_bytes is not None:
            file_size_mb = round(
                latest_success.exported_file_size_bytes / (1024 * 1024), 2
            )

        last_run = LastRunInfo(
            job_id=latest_success.id,
            started_at=latest_success.started_at,
            completed_at=latest_success.completed_at,
            status=latest_success.status,
            file_name=latest_success.exported_file_name,
            file_size_mb=file_size_mb,
        )
    elif jobs:
        # Fallback to the most recent job if no success job exists
        latest_job = jobs[0]
        file_size_mb = None
        if latest_job.exported_file_size_bytes is not None:
            file_size_mb = round(latest_job.exported_file_size_bytes / (1024 * 1024), 2)

        last_run = LastRunInfo(
            job_id=latest_job.id,
            started_at=latest_job.started_at,
            completed_at=latest_job.completed_at,
            status=latest_job.status,
            file_name=latest_job.exported_file_name,
            file_size_mb=file_size_mb,
        )

    # Build history list
    history = []
    for j in jobs:
        history.append(
            HistoryItem(
                job_id=j.id,
                started_at=j.started_at,
                status=j.status,
                error_message=j.details if j.status == "FAILED" else None,
            )
        )

    return StatusResponse(
        last_run=last_run,
        next_run_scheduled_at=get_next_run_scheduled_at(),
        history=history,
    )


@router.get("/config", response_model=ConfigResponse)
def get_export_config(admin: bool = Depends(verify_admin)):
    """
    Retrieves the current export configuration settings.
    """
    return ConfigResponse(
        gcs_bucket_name=dynamic_config["gcs_bucket_name"],
        encryption_standard=dynamic_config["encryption_standard"],
        retention_days=dynamic_config["retention_days"],
        schedule_cron=dynamic_config["schedule_cron"],
    )


@router.put("/config", response_model=ConfigResponse)
def update_export_config(
    payload: UpdateConfigSchema, admin: bool = Depends(verify_admin)
):
    """
    Updates the export configuration settings.
    """
    if payload.gcs_bucket_name is not None:
        dynamic_config["gcs_bucket_name"] = payload.gcs_bucket_name
        settings.GCS_BUCKET_NAME = payload.gcs_bucket_name
    if payload.encryption_standard is not None:
        dynamic_config["encryption_standard"] = payload.encryption_standard
    if payload.retention_days is not None:
        dynamic_config["retention_days"] = payload.retention_days
    if payload.schedule_cron is not None:
        dynamic_config["schedule_cron"] = payload.schedule_cron

    return ConfigResponse(
        gcs_bucket_name=dynamic_config["gcs_bucket_name"],
        encryption_standard=dynamic_config["encryption_standard"],
        retention_days=dynamic_config["retention_days"],
        schedule_cron=dynamic_config["schedule_cron"],
    )
