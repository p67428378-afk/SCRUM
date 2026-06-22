"""
Module: facility
Purpose: Database models for Facility and Booking
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    rate = Column(Numeric, nullable=False)

    bookings = relationship(
        "Booking", back_populates="facility", cascade="all, delete-orphan"
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    facility_id = Column(String(36), ForeignKey("facilities.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Confirmed")
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    resident = relationship("Resident", back_populates="bookings")
    facility = relationship("Facility", back_populates="bookings")
