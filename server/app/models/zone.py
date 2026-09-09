import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from server.app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Zone(Base):
    __tablename__ = "zones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    utility_metrics = relationship(
        "UtilityMetric", back_populates="zone", cascade="all, delete-orphan"
    )
    service_requests = relationship("ServiceRequest", back_populates="zone")
