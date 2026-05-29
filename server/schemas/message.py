
from pydantic import BaseModel
from datetime import datetime
import uuid

class Message(BaseModel):
    message_id: uuid.UUID
    rental_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True
