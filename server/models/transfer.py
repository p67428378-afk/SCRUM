import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String(36), ForeignKey("accounts.id"), nullable=False, index=True)
    receiver_id = Column(String(36), ForeignKey("accounts.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(32), nullable=False, default="COMPLETED")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    sender = relationship("Account", foreign_keys=[sender_id], back_populates="sent_transfers")
    receiver = relationship("Account", foreign_keys=[receiver_id], back_populates="received_transfers")
