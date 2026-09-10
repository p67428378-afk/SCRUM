import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from server.database import Base, GUID


class Account(Base):
    __tablename__ = "accounts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_name = Column(String(100), nullable=False)
    balance = Column(Numeric(precision=12, scale=2), nullable=False, default=0.00)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
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
