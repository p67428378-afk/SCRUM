import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime
from server.database import Base


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String(255), nullable=False, index=True)
    receiver_id = Column(String(255), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(32), nullable=False, default="COMPLETED")
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(255), primary_key=True, index=True)
    balance = Column(Float, nullable=False, default=0.0)
    email = Column(String(255), nullable=True, unique=True)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=get_utc_now,
        onupdate=get_utc_now,
        nullable=False,
    )
