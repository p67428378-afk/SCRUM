import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="buyer", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False
    )

    # Relationships
    cats = relationship("Cat", back_populates="seller", cascade="all, delete-orphan")
    inquiries = relationship("Inquiry", back_populates="buyer")


class Cat(Base):
    __tablename__ = "cats"

    id = Column(String, primary_key=True, default=generate_uuid)
    seller_id = Column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String, nullable=False)
    breed = Column(String, nullable=False, index=True)
    age_months = Column(Integer, nullable=False)
    gender = Column(String, nullable=False, index=True)
    price = Column(Numeric, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    status = Column(String, default="Available", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False
    )

    # Relationships
    seller = relationship("User", back_populates="cats")
    inquiries = relationship(
        "Inquiry", back_populates="cat", cascade="all, delete-orphan"
    )


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(String, primary_key=True, default=generate_uuid)
    cat_id = Column(String, ForeignKey("cats.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=True)
    buyer_name = Column(String, nullable=False)
    buyer_email = Column(String, nullable=False)
    buyer_phone = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    cat = relationship("Cat", back_populates="inquiries")
    buyer = relationship("User", back_populates="inquiries")
