import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Numeric,
    Text,
    Date,
    Time,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(
        String(20), default="Devotee", nullable=False
    )  # 'Devotee', 'Staff', 'Admin'
    preferred_language = Column(String(50), default="Hindi", nullable=False)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    bookings = relationship(
        "Booking", back_populates="user", cascade="all, delete-orphan"
    )
    donations = relationship(
        "Donation", back_populates="user", cascade="all, delete-orphan"
    )


class Pooja(Base):
    __tablename__ = "poojas"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False, default=0.0)
    duration_minutes = Column(Integer, default=30, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    slots = relationship(
        "PoojaSlot", back_populates="pooja", cascade="all, delete-orphan"
    )


class PoojaSlot(Base):
    __tablename__ = "pooja_slots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    pooja_id = Column(String(36), ForeignKey("poojas.id"), nullable=False)
    slot_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_capacity = Column(Integer, default=10, nullable=False)
    booked_count = Column(Integer, default=0, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    pooja = relationship("Pooja", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    slot_id = Column(String(36), ForeignKey("pooja_slots.id"), nullable=False)
    devotee_name = Column(String(100), nullable=False)
    devotee_phone = Column(String(20), nullable=True)
    gotra = Column(String(50), nullable=True)
    nakshatra = Column(String(50), nullable=True)
    booking_type = Column(
        String(20), default="Online", nullable=False
    )  # 'Online', 'Offline'
    status = Column(
        String(20), default="Confirmed", nullable=False
    )  # 'Confirmed', 'Cancelled'
    amount_paid = Column(Numeric(10, 2), nullable=False, default=0.0)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User", back_populates="bookings")
    slot = relationship("PoojaSlot", back_populates="bookings")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    receipt_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    donor_name = Column(String(100), nullable=False)
    donor_email = Column(String(255), nullable=True)
    donor_phone = Column(String(20), nullable=True)
    donor_pan = Column(String(20), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(
        String(50), default="UPI", nullable=False
    )  # 'Cash', 'UPI', 'Card', 'NetBanking'
    tax_exemption_80g = Column(Boolean, default=True, nullable=False)
    purpose = Column(String(100), default="Temple Renovation & Seva", nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="donations")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
