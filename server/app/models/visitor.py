"""
Module: visitor
Purpose: Database model for Visitor
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    name = Column(String, nullable=False)
    expected_arrival = Column(DateTime, nullable=False)
    actual_arrival = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="Expected")
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    resident = relationship("Resident", back_populates="visitors")
