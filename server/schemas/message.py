from datetime import datetime
import uuid
from pydantic import BaseModel, Field

class MessageBase(BaseModel):
    rental_id: uuid.UUID
    sender_id: uuid.UUID
    recipient_id: uuid.UUID
    content: str = Field(..., min_length=1)

class MessageCreate(MessageBase):
    pass

class MessageInDB(MessageBase):
    message_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
