import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid():
    return str(uuid.uuid4())


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    items = relationship("Item", back_populates="category")


class Item(Base):
    __tablename__ = "items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    sku = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    reorder_threshold = Column(Integer, default=10, nullable=False)
    reorder_quantity = Column(Integer, default=50, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    category = relationship("Category", back_populates="items")
    stock_levels = relationship(
        "StockLevel", back_populates="item", cascade="all, delete-orphan"
    )
    adjustments = relationship("StockAdjustment", back_populates="item")
    alerts = relationship("StockAlert", back_populates="item")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    stock_levels = relationship(
        "StockLevel", back_populates="warehouse", cascade="all, delete-orphan"
    )
    adjustments = relationship("StockAdjustment", back_populates="warehouse")
    alerts = relationship("StockAlert", back_populates="warehouse")


class StockLevel(Base):
    __tablename__ = "stock_levels"
    __table_args__ = (
        UniqueConstraint("item_id", "warehouse_id", name="uix_item_warehouse"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    quantity_on_hand = Column(Integer, default=0, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    item = relationship("Item", back_populates="stock_levels")
    warehouse = relationship("Warehouse", back_populates="stock_levels")


class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    user_id = Column(String(36), nullable=False)
    quantity_change = Column(Integer, nullable=False)
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    reason_code = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    item = relationship("Item", back_populates="adjustments")
    warehouse = relationship("Warehouse", back_populates="adjustments")


class StockAlert(Base):
    __tablename__ = "stock_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    item_id = Column(String(36), ForeignKey("items.id"), nullable=False)
    warehouse_id = Column(String(36), ForeignKey("warehouses.id"), nullable=False)
    current_quantity = Column(Integer, nullable=False)
    reorder_threshold = Column(Integer, nullable=False)
    status = Column(
        String(20), default="ACTIVE", nullable=False
    )  # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    item = relationship("Item", back_populates="alerts")
    warehouse = relationship("Warehouse", back_populates="alerts")
