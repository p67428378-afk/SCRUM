"""
Module: maintenance
Purpose: Database model for MaintenanceRequest
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Pending")
    image_url = Column(String, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    resident = relationship("Resident", back_populates="maintenance_requests")
