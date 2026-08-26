import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from server.app.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class DogListing(Base):
    __tablename__ = "dog_listings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    seller_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    breed = Column(String(100), index=True, nullable=False)
    age_months = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    location = Column(String(150), index=True, nullable=False)
    description = Column(Text, nullable=False)
    health_records = Column(Text, nullable=True)
    photo_urls = Column(JSON, default=list, nullable=False)
    status = Column(
        String(20), default="available", nullable=False
    )  # available, pending, sold
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    seller = relationship("User", back_populates="listings")
    inquiries = relationship(
        "Inquiry", back_populates="listing", cascade="all, delete-orphan"
    )
