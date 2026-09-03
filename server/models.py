import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from server.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, unique=True, index=True)
    category = Column(String(50), nullable=False, index=True)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    order_items = relationship("OrderItem", back_populates="menu_item")


class Table(Base):
    __tablename__ = "tables"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    table_number = Column(Integer, nullable=False, unique=True, index=True)
    capacity = Column(Integer, nullable=False)
    status = Column(
        String(20), nullable=False, default="Available"
    )  # Available, Reserved, Occupied
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    reservations = relationship(
        "Reservation", back_populates="table", cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="table")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    table_id = Column(String(36), ForeignKey("tables.id"), nullable=False)
    customer_name = Column(String(100), nullable=False)
    party_size = Column(Integer, nullable=False)
    reservation_time = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(
        String(20), nullable=False, default="Active"
    )  # Active, Cancelled, Completed
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    table = relationship("Table", back_populates="reservations")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(20), nullable=False, unique=True, index=True)
    table_id = Column(String(36), ForeignKey("tables.id"), nullable=True)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax = Column(Float, nullable=False, default=0.0)
    total_price = Column(Float, nullable=False, default=0.0)
    status = Column(
        String(20), nullable=False, default="Pending"
    )  # Pending, Preparing, Ready, Completed, Cancelled
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
    table = relationship("Table", back_populates="orders")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")
