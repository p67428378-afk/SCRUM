import uuid
from datetime import datetime, date
from typing import List
from sqlalchemy import String, Boolean, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from server.app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Guide(Base):
    __tablename__ = "guides"

    guide_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="guide")
    availabilities: Mapped[List["Availability"]] = relationship(
        "Availability", back_populates="guide"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="guide"
    )


class Booking(Base):
    __tablename__ = "bookings"

    booking_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_uuid
    )
    guide_id: Mapped[str] = mapped_column(
        String, ForeignKey("guides.guide_id"), nullable=False
    )
    client_name: Mapped[str] = mapped_column(String, nullable=False)
    client_contact: Mapped[str] = mapped_column(String, nullable=False)
    trek_name: Mapped[str] = mapped_column(String, nullable=False)
    trek_date: Mapped[date] = mapped_column(Date, nullable=False)
    participants: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    payment_status: Mapped[str] = mapped_column(
        String, nullable=False, default="Pending"
    )
    status: Mapped[str] = mapped_column(String, nullable=False, default="Pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    guide: Mapped["Guide"] = relationship("Guide", back_populates="bookings")


class Availability(Base):
    __tablename__ = "availabilities"

    availability_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_uuid
    )
    guide_id: Mapped[str] = mapped_column(
        String, ForeignKey("guides.guide_id"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    guide: Mapped["Guide"] = relationship("Guide", back_populates="availabilities")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=generate_uuid
    )
    guide_id: Mapped[str] = mapped_column(
        String, ForeignKey("guides.guide_id"), nullable=False
    )
    message: Mapped[str] = mapped_column(String, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )

    guide: Mapped["Guide"] = relationship("Guide", back_populates="notifications")
