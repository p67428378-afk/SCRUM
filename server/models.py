import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, BIGINT, Text
from server.database import Base


def get_utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class ExportJob(Base):
    __tablename__ = "export_jobs"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    started_at = Column(DateTime, default=get_utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="IN_PROGRESS", nullable=False)
    exported_file_name = Column(String(255), nullable=True)
    exported_file_size_bytes = Column(BIGINT, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False
    )
