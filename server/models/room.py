import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime
from server.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    room_number = Column(String(50), unique=True, nullable=False)
    type = Column(String(50), nullable=False)
    capacity = Column(Integer, default=2, nullable=False)
    price_per_night = Column(Numeric(10, 2), default=0.00, nullable=False)
    status = Column(String(50), default="Available", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
