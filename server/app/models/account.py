import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from server.app.core.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_number = Column(String(64), unique=True, nullable=False, index=True)
    balance = Column(Numeric(12, 2), nullable=False, default=0.00)
    currency = Column(String(3), nullable=False, default="USD")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    sent_transfers = relationship(
        "Transfer",
        foreign_keys="Transfer.sender_id",
        back_populates="sender",
        cascade="all, delete-orphan",
    )
    received_transfers = relationship(
        "Transfer",
        foreign_keys="Transfer.receiver_id",
        back_populates="receiver",
        cascade="all, delete-orphan",
    )
