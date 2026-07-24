import datetime
import uuid

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import backref, relationship

from server.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    account_number = Column(String(50), unique=True, nullable=False)
    account_type = Column(String(50), nullable=False)
    balance = Column(Numeric(15, 2), nullable=False, default=0.00)
    available_balance = Column(Numeric(15, 2), nullable=False, default=0.00)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(50), nullable=False, default="active")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    user = relationship("User", backref="accounts")
    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )


class Payee(Base):
    __tablename__ = "payees"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(255), nullable=False)
    account_number = Column(String(50), nullable=False)
    routing_number = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False, default="pending_verification")
    verification_code = Column(String(10), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    user = relationship("User", backref="payees")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    type = Column(String(50), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    description = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    payee_id = Column(
        UUID(as_uuid=True),
        ForeignKey("payees.id", ondelete="SET NULL"),
        nullable=True,
    )
    status = Column(String(50), nullable=False, default="completed")
    reference_id = Column(String(100), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    account = relationship("Account", back_populates="transactions")
    payee = relationship("Payee", backref="transactions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
    event_type = Column(String(100), nullable=False)
    actor = Column(String(255), nullable=False)
    resource = Column(String(255), nullable=False)
    ip_address = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    details = Column(JSON, nullable=False, default=dict)


class AlertPreference(Base):
    __tablename__ = "alert_preferences"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    push_enabled = Column(Boolean, nullable=False, default=True)
    sms_enabled = Column(Boolean, nullable=False, default=True)
    email_enabled = Column(Boolean, nullable=False, default=True)
    low_balance_threshold = Column(Numeric(15, 2), nullable=False, default=100.00)
    large_transaction_threshold = Column(
        Numeric(15, 2), nullable=False, default=1000.00
    )

    # Relationships
    user = relationship(
        "User",
        backref=backref(
            "alert_preference", uselist=False, cascade="all, delete-orphan"
        ),
    )
