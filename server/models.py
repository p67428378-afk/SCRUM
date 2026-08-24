import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # Admin, Manager, Staff
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    adjustments = relationship("StockAdjustment", back_populates="user")


class Item(Base):
    __tablename__ = "items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False)
    unit_of_measure = Column(String(50), nullable=False)
    supplier_name = Column(String(255), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    inventory = relationship(
        "Inventory", uselist=False, back_populates="item", cascade="all, delete-orphan"
    )
    adjustments = relationship(
        "StockAdjustment", back_populates="item", cascade="all, delete-orphan"
    )


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), unique=True, nullable=False)
    current_stock = Column(Numeric(12, 3), nullable=False)
    reorder_threshold = Column(Numeric(12, 3), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )

    item = relationship("Item", back_populates="inventory")


class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    adjustment_type = Column(String(50), nullable=False)  # Correction, Damage, Restock
    quantity_changed = Column(Numeric(12, 3), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    item = relationship("Item", back_populates="adjustments")
    user = relationship("User", back_populates="adjustments")
