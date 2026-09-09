import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Tea(Base):
    __tablename__ = "teas"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    current_stock_grams = Column(Float, nullable=False, default=0.0)
    min_threshold_grams = Column(Float, nullable=False, default=500.0)
    unit_price = Column(Float, nullable=False)
    supplier_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    inventory_transactions = relationship(
        "InventoryTransaction", back_populates="tea", cascade="all, delete-orphan"
    )
    order_items = relationship("OrderItem", back_populates="tea")
    recipes = relationship("Recipe", back_populates="tea", cascade="all, delete-orphan")


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tea_id = Column(
        String(36), ForeignKey("teas.id", ondelete="CASCADE"), nullable=False
    )
    change_grams = Column(Float, nullable=False)
    reason = Column(
        String(50), nullable=False
    )  # RESTOCK, AUDIT, SPOILAGE, ORDER_DEDUCTION
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    tea = relationship("Tea", back_populates="inventory_transactions")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="COMPLETED")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    tea_id = Column(String(36), ForeignKey("teas.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    sweetness_level = Column(String(20), nullable=False)
    temperature = Column(String(20), nullable=False)
    milk_option = Column(String(30), nullable=False)
    add_ons = Column(JSON, nullable=False, default=list)
    item_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    tea = relationship("Tea", back_populates="order_items")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tea_id = Column(
        String(36), ForeignKey("teas.id", ondelete="CASCADE"), nullable=False
    )
    steep_temperature_c = Column(Float, nullable=False)
    steep_time_seconds = Column(Integer, nullable=False)
    leaf_water_ratio_g_per_ml = Column(String(50), nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    tea = relationship("Tea", back_populates="recipes")
    quality_logs = relationship(
        "QualityLog", back_populates="recipe", cascade="all, delete-orphan"
    )


class QualityLog(Base):
    __tablename__ = "quality_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipe_id = Column(
        String(36), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False
    )
    rating = Column(Integer, nullable=False)  # 1..5
    feedback = Column(Text, nullable=True)
    brewed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    recipe = relationship("Recipe", back_populates="quality_logs")
