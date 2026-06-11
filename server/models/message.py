import uuid
from sqlalchemy import Column, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from server.database import Base

class Message(Base):
    __tablename__ = "Messages"

    message_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rental_id = Column(String, ForeignKey("Rentals.rental_id"), nullable=False)
    sender_id = Column(String, nullable=False)  # Can be Renter or CarOwner ID
    recipient_id = Column(String, nullable=False) # Can be Renter or CarOwner ID
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now()) # Using created_at as the message timestamp
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    rental = relationship("Rental")

    def __repr__(self):
        return f"<Message(message_id='{self.message_id}', rental_id='{self.rental_id}', sender_id='{self.sender_id}')>"
