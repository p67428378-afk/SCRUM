import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from server.app.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("dog_listings.id"), nullable=False)
    buyer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String(100), nullable=False)
    buyer_email = Column(String(255), nullable=False)
    buyer_phone = Column(String(20), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    listing = relationship("DogListing", back_populates="inquiries")
    buyer = relationship("User", back_populates="inquiries")
