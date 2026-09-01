import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    Boolean,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from server.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    role = Column(String(50), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Property(Base):
    __tablename__ = "properties"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    zip_code = Column(String(20), index=True, nullable=False)
    address = Column(String(255), nullable=True)
    sqft = Column(Integer, nullable=False, default=1000)
    bedrooms = Column(Integer, default=1)
    bathrooms = Column(Float, default=1.0)
    status = Column(String(50), default="Active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    price_history = relationship(
        "PropertyPriceHistory",
        back_populates="property",
        cascade="all, delete-orphan",
        order_by="PropertyPriceHistory.recorded_at",
    )


class PropertyPriceHistory(Base):
    __tablename__ = "property_price_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id = Column(
        String(36),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    price = Column(Float, nullable=False)
    change_event = Column(
        String(30), nullable=False
    )  # listed, price_drop, price_increase
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    property = relationship("Property", back_populates="price_history")
