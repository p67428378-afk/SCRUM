import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base, GUID


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    sender_id = Column(
        GUID, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    receiver_id = Column(
        GUID, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String(20), nullable=False, default="COMPLETED")
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

    sender = relationship(
        "Account",
        foreign_keys=[sender_id],
        back_populates="sent_transfers",
    )
    receiver = relationship(
        "Account",
        foreign_keys=[receiver_id],
        back_populates="received_transfers",
    )
