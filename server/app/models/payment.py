"""
Module: payment
Purpose: Database models for Bill and Payment
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from server.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Bill(Base):
    __tablename__ = "bills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("residents.id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="Unpaid")
    description = Column(String, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    resident = relationship("Resident", back_populates="bills")
    payments = relationship(
        "Payment", back_populates="bill", cascade="all, delete-orphan"
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    bill_id = Column(String(36), ForeignKey("bills.id"), nullable=False)
    amount_paid = Column(Numeric, nullable=False)
    transaction_id = Column(String, nullable=False, unique=True, default=generate_uuid)
    payment_date = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    payment_method = Column(String, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    bill = relationship("Bill", back_populates="payments")
