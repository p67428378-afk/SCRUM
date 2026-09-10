import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from server.database import Base


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(32), default="COMPLETED", nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("idx_transfers_sender_id", "sender_id"),
        Index("idx_transfers_receiver_id", "receiver_id"),
        Index("idx_transfers_created_at", "created_at"),
    )
