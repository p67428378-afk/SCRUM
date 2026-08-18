import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="staff", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), unique=True, index=True, nullable=False)
    unit = Column(String(50), nullable=False)  # e.g., kg, g, pcs, liters
    stock_quantity = Column(Float, default=0.0, nullable=False)
    reorder_threshold = Column(Float, default=10.0, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    recipes = relationship(
        "Recipe", back_populates="ingredient", cascade="all, delete-orphan"
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    category = Column(
        String(100), nullable=False, default="General"
    )  # e.g., Pastry, Bread, Cake
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    recipes = relationship(
        "Recipe", back_populates="product", cascade="all, delete-orphan"
    )
    order_items = relationship("OrderItem", back_populates="product")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    ingredient_id = Column(
        String(36), ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False
    )
    quantity_required = Column(
        Float, nullable=False
    )  # Quantity of ingredient per single product unit
    created_at = Column(DateTime, default=utc_now, nullable=False)

    product = relationship("Product", back_populates="recipes")
    ingredient = relationship("Ingredient", back_populates="recipes")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_name = Column(String(255), nullable=True)
    order_type = Column(
        String(50), nullable=False, default="Instant"
    )  # "Instant", "Pre-Order"
    status = Column(
        String(50), nullable=False, default="Pending"
    )  # "Pending", "In Production", "Ready for Pickup", "Completed", "Cancelled"
    pickup_date = Column(DateTime, nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(
        String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
