"""
Module: resident
Purpose: Database models for Resident and FamilyMember
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship as sqla_relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Resident(Base):
    __tablename__ = "residents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    apartment_number = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    family_members = sqla_relationship(
        "FamilyMember", back_populates="resident", cascade="all, delete-orphan"
    )
    maintenance_requests = sqla_relationship(
        "MaintenanceRequest", back_populates="resident", cascade="all, delete-orphan"
    )
    bills = sqla_relationship(
        "Bill", back_populates="resident", cascade="all, delete-orphan"
    )
    discussions = sqla_relationship(
        "Discussion", back_populates="resident", cascade="all, delete-orphan"
    )
    comments = sqla_relationship(
        "Comment", back_populates="resident", cascade="all, delete-orphan"
    )
    bookings = sqla_relationship(
        "Booking", back_populates="resident", cascade="all, delete-orphan"
    )
    visitors = sqla_relationship(
        "Visitor", back_populates="resident", cascade="all, delete-orphan"
    )


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    name = Column(String, nullable=False)
    relationship = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    resident = sqla_relationship("Resident", back_populates="family_members")
