import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from server.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(50), nullable=False)
    role = Column(String(50), nullable=False, default="customer")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    mfa_secret = relationship(
        "MfaSecret", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    accounts = relationship(
        "Account", back_populates="user", cascade="all, delete-orphan"
    )
    transfers = relationship(
        "Transfer", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="user", cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    full_name = Column(String(255), nullable=False)
    address = Column(String(1024), nullable=False)
    alert_on_transfer = Column(Boolean, nullable=False, default=True)
    alert_on_login = Column(Boolean, nullable=False, default=True)
    alert_threshold = Column(Numeric(15, 2), nullable=False, default=0.00)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    user = relationship("User", back_populates="profile")


class MfaSecret(Base):
    __tablename__ = "mfa_secrets"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    secret_key = Column(String(255), nullable=False)
    mfa_type = Column(String(50), nullable=False, default="sms")
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    user = relationship("User", back_populates="mfa_secret")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    account_type = Column(String(50), nullable=False)
    account_number_masked = Column(String(50), nullable=False)
    balance = Column(Numeric(15, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    user = relationship("User", back_populates="accounts")
    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    description = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="completed")
    reference_id = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    account = relationship("Account", back_populates="transactions")


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    source_account_ref = Column(String(255), nullable=False)
    destination_account_ref = Column(String(255), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="pending")
    core_banking_tx_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    user = relationship("User", back_populates="transfers")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    event_type = Column(String(100), nullable=False)
    details = Column(JSON, nullable=False, default=dict)
    ip_address = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)

    user = relationship("User", back_populates="audit_logs")
