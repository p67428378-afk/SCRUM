from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, EmailStr, Field

class CarOwnerBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class CarOwnerCreate(CarOwnerBase):
    password: str = Field(..., min_length=8)

class CarOwnerInDB(CarOwnerBase):
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
