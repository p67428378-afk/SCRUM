from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TriggerResponse(BaseModel):
    message: str
    job_id: str


class LastRunInfo(BaseModel):
    job_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    file_name: Optional[str] = None
    file_size_mb: Optional[float] = None


class HistoryItem(BaseModel):
    job_id: str
    started_at: datetime
    status: str
    error_message: Optional[str] = None


class StatusResponse(BaseModel):
    last_run: Optional[LastRunInfo] = None
    next_run_scheduled_at: datetime
    history: List[HistoryItem]


class ConfigResponse(BaseModel):
    gcs_bucket_name: str
    encryption_standard: str
    retention_days: int
    schedule_cron: str


class UpdateConfigSchema(BaseModel):
    gcs_bucket_name: Optional[str] = None
    encryption_standard: Optional[str] = None
    retention_days: Optional[int] = None
    schedule_cron: Optional[str] = None
