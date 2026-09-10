import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from server.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_number = Column(String(64), unique=True, nullable=False, index=True)
    balance = Column(Float, nullable=False, default=0.0)
    owner_name = Column(String(128), nullable=False, default="")
    email = Column(String(128), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    sent_transfers = relationship("Transfer", foreign_keys="Transfer.sender_id", back_populates="sender")
    received_transfers = relationship("Transfer", foreign_keys="Transfer.receiver_id", back_populates="receiver")
