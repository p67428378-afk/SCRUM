import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    Uuid,
)
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Front Desk Staff")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_number = Column(String(20), unique=True, index=True, nullable=False)
    room_type = Column(String(50), nullable=False)  # Standard, Deluxe, Suite
    capacity = Column(Integer, nullable=False, default=2)
    base_rate_per_night = Column(Numeric(10, 2), nullable=False)
    status = Column(
        String(50), nullable=False, default="Available"
    )  # Available, Occupied, Cleaning, Maintenance
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    reservations = relationship("Reservation", back_populates="room")


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    id_proof_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    reservations = relationship("Reservation", back_populates="guest")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(Uuid(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    guest_id = Column(Uuid(as_uuid=True), ForeignKey("guests.id"), nullable=False)
    check_in_date = Column(Date, index=True, nullable=False)
    check_out_date = Column(Date, index=True, nullable=False)
    number_of_guests = Column(Integer, nullable=False, default=1)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        String(50), nullable=False, default="Confirmed"
    )  # Confirmed, Checked-In, Checked-Out, Cancelled
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    room = relationship("Room", back_populates="reservations")
    guest = relationship("Guest", back_populates="reservations")
    folio = relationship("Folio", back_populates="reservation", uselist=False)


class Folio(Base):
    __tablename__ = "folios"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reservation_id = Column(
        Uuid(as_uuid=True), ForeignKey("reservations.id"), unique=True, nullable=False
    )
    room_charges = Column(Numeric(10, 2), nullable=False, default=0.00)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    total_due = Column(Numeric(10, 2), nullable=False, default=0.00)
    payment_status = Column(
        String(50), nullable=False, default="Pending"
    )  # Pending, Paid, Refunded
    payment_method = Column(String(50), nullable=True)  # Credit Card, Cash, Debit
    key_card_assigned = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    reservation = relationship("Reservation", back_populates="folio")
