import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer
from sqlalchemy.orm import relationship
from server.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    booking_id = Column(String(36), ForeignKey("bookings.id"), nullable=True)
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), default="Placed", nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    booking = relationship("Booking", backref="orders")
    restaurant = relationship("Restaurant", backref="orders")
    items = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", backref="order_items")
