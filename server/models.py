import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    Time,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


staff_services = Table(
    "staff_services",
    Base.metadata,
    Column(
        "staff_id",
        String(36),
        ForeignKey("staff.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "service_id",
        String(36),
        ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    preferred_staff_id = Column(
        String(36), ForeignKey("staff.id", ondelete="SET NULL"), nullable=True
    )
    loyalty_points = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), default="customer", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    appointments = relationship(
        "Appointment", back_populates="customer", cascade="all, delete-orphan"
    )
    loyalty_transactions = relationship(
        "LoyaltyTransaction", back_populates="customer", cascade="all, delete-orphan"
    )
    preferred_staff = relationship(
        "Staff", foreign_keys=[preferred_staff_id], backref="preferred_by_customers"
    )


class Staff(Base):
    __tablename__ = "staff"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    services = relationship(
        "Service", secondary=staff_services, back_populates="staff_members"
    )
    schedules = relationship(
        "StaffSchedule", back_populates="staff", cascade="all, delete-orphan"
    )
    appointments = relationship("Appointment", back_populates="staff")


class Service(Base):
    __tablename__ = "services"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    loyalty_points_earned = Column(Integer, default=10, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    staff_members = relationship(
        "Staff", secondary=staff_services, back_populates="services"
    )
    appointments = relationship("Appointment", back_populates="service")


class StaffSchedule(Base):
    __tablename__ = "staff_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    staff_id = Column(
        String(36), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week = Column(Integer, nullable=False)  # 0=Mon, 6=Sun
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    break_start = Column(Time, nullable=True)
    break_end = Column(Time, nullable=True)

    staff = relationship("Staff", back_populates="schedules")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(
        String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False
    )
    staff_id = Column(
        String(36), ForeignKey("staff.id", ondelete="CASCADE"), nullable=False
    )
    service_id = Column(
        String(36), ForeignKey("services.id", ondelete="CASCADE"), nullable=False
    )
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(
        String(50), default="booked", nullable=False
    )  # booked, completed, cancelled
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    customer = relationship("Customer", back_populates="appointments")
    staff = relationship("Staff", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")


class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(
        String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False
    )
    appointment_id = Column(
        String(36), ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True
    )
    points_change = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # accrual, redemption
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    customer = relationship("Customer", back_populates="loyalty_transactions")
    appointment = relationship("Appointment")
