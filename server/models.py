import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from server.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    cart = relationship(
        "Cart", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    books = relationship(
        "Book", back_populates="category", cascade="all, delete-orphan"
    )


class Book(Base):
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), index=True, nullable=False)
    isbn = Column(String(50), unique=True, index=True, nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    stock_quantity = Column(Integer, nullable=False, default=0)
    rating = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    cover_image = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    category = relationship("Category", back_populates="books")
    cart_items = relationship(
        "CartItem", back_populates="book", cascade="all, delete-orphan"
    )
    order_items = relationship("OrderItem", back_populates="book")


class Cart(Base):
    __tablename__ = "carts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(36), ForeignKey("users.id"), unique=True, index=True, nullable=False
    )
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="cart")
    items = relationship(
        "CartItem", back_populates="cart", cascade="all, delete-orphan"
    )


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cart_id = Column(String(36), ForeignKey("carts.id"), nullable=False, index=True)
    book_id = Column(String(36), ForeignKey("books.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    cart = relationship("Cart", back_populates="items")
    book = relationship("Book", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(
        String(50), default="Processing", nullable=False
    )  # Processing, Shipped, Delivered, Cancelled
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    shipping_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    shipping_address = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="orders")
    order_items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, index=True)
    book_id = Column(String(36), ForeignKey("books.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    order = relationship("Order", back_populates="order_items")
    book = relationship("Book", back_populates="order_items")
