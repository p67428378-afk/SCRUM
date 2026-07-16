import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=False)
    guest_name = Column(String(255), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    status = Column(String(50), default="Booked", nullable=False)
    total_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    room = relationship("Room", backref="bookings")
