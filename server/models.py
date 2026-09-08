import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    household_address = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False, default="Resident")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    bookings = relationship(
        "Booking", back_populates="resident", cascade="all, delete-orphan"
    )
    announcements = relationship(
        "Announcement", back_populates="author", cascade="all, delete-orphan"
    )
    created_service_requests = relationship(
        "ServiceRequest",
        foreign_keys="ServiceRequest.resident_id",
        back_populates="resident",
    )
    assigned_service_requests = relationship(
        "ServiceRequest",
        foreign_keys="ServiceRequest.assigned_staff_id",
        back_populates="assigned_staff",
    )


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=False, default=50)
    hourly_rate = Column(Float, nullable=False, default=0.0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    bookings = relationship(
        "Booking", back_populates="facility", cascade="all, delete-orphan"
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    facility_id = Column(String(36), ForeignKey("facilities.id"), nullable=False)
    resident_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    booking_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    start_time = Column(String(8), nullable=False)  # HH:MM:SS
    end_time = Column(String(8), nullable=False)  # HH:MM:SS
    purpose = Column(String(255), nullable=True)
    status = Column(
        String(20), nullable=False, default="Confirmed"
    )  # Confirmed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    facility = relationship("Facility", back_populates="bookings")
    resident = relationship("User", back_populates="bookings")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    urgency = Column(
        String(20), nullable=False, default="Info"
    )  # Info, Warning, Emergency
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    is_archived = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    author = relationship("User", back_populates="announcements")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    category = Column(
        String(50), nullable=False
    )  # Plumbing, Electrical, Public Maintenance
    description = Column(Text, nullable=False)
    status = Column(
        String(20), nullable=False, default="Open"
    )  # Open, In Progress, Resolved
    resident_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_staff_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    resident = relationship(
        "User", foreign_keys=[resident_id], back_populates="created_service_requests"
    )
    assigned_staff = relationship(
        "User",
        foreign_keys=[assigned_staff_id],
        back_populates="assigned_service_requests",
    )
