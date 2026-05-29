
import uuid
from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.models.base import Base

class Message(Base):
    __tablename__ = 'messages'
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rental_id = Column(UUID(as_uuid=True), ForeignKey('rentals.rental_id'))
    sender_id = Column(UUID(as_uuid=True))
    recipient_id = Column(UUID(as_uuid=True))
    content = Column(Text)
    timestamp = Column(DateTime)

    rental = relationship("Rental")
