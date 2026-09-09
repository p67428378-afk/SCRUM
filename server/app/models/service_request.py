import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number = Column(String(50), unique=True, nullable=False, index=True)
    citizen_id = Column(
        String(36), ForeignKey("citizens.id"), nullable=True, index=True
    )
    zone_id = Column(String(36), ForeignKey("zones.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="SUBMITTED")
    priority = Column(String(50), nullable=False, default="MEDIUM")
    assigned_department = Column(String(100), nullable=True, default="PUBLIC_WORKS")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    citizen = relationship("Citizen", back_populates="service_requests")
    zone = relationship("Zone", back_populates="service_requests")
