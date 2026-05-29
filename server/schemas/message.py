
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class MessageBase(BaseModel):
    rental_id: UUID
    sender_id: UUID
    recipient_id: UUID
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    message_id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True
