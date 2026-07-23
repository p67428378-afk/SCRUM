import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    funding_accounts = relationship(
        "FundingAccount", back_populates="user", cascade="all, delete-orphan"
    )
    recurring_payments = relationship(
        "RecurringPayment", back_populates="user", cascade="all, delete-orphan"
    )


class Payee(Base):
    __tablename__ = "payees"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    recurring_payments = relationship("RecurringPayment", back_populates="payee")


class FundingAccount(Base):
    __tablename__ = "funding_accounts"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    account_type = Column(String(50), nullable=False)  # CHECKING or SAVINGS
    account_provider = Column(String(100), nullable=False)
    account_number_last4 = Column(String(4), nullable=False)
    encrypted_token = Column(String, nullable=True)
    balance = Column(Numeric(12, 2), default=1000.00, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="funding_accounts")
    splits = relationship(
        "PaymentSplit", back_populates="funding_account", cascade="all, delete-orphan"
    )


class RecurringPayment(Base):
    __tablename__ = "recurring_payments"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    payee_id = Column(String(36), ForeignKey("payees.id"), nullable=False)
    description = Column(String(255), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    frequency = Column(String(50), nullable=False)  # WEEKLY, MONTHLY, ANNUALLY
    start_date = Column(Date, nullable=False)
    next_payment_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="recurring_payments")
    payee = relationship("Payee", back_populates="recurring_payments")
    splits = relationship(
        "PaymentSplit", back_populates="recurring_payment", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "PaymentTransaction",
        back_populates="recurring_payment",
        cascade="all, delete-orphan",
    )


class PaymentSplit(Base):
    __tablename__ = "payment_splits"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    recurring_payment_id = Column(
        String(36), ForeignKey("recurring_payments.id"), nullable=False
    )
    funding_account_id = Column(
        String(36), ForeignKey("funding_accounts.id"), nullable=False
    )
    split_type = Column(String(50), nullable=False)  # PERCENTAGE or FIXED
    split_value = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    recurring_payment = relationship("RecurringPayment", back_populates="splits")
    funding_account = relationship("FundingAccount", back_populates="splits")


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        unique=True,
        nullable=False,
    )
    recurring_payment_id = Column(
        String(36), ForeignKey("recurring_payments.id"), nullable=False
    )
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), nullable=False)  # PENDING, SUCCESS, FAILED
    gateway_transaction_id = Column(String(255), nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    recurring_payment = relationship("RecurringPayment", back_populates="transactions")
