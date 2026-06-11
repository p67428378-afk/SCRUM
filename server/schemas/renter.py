from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, EmailStr, Field

class RenterBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class RenterCreate(RenterBase):
    password: str = Field(..., min_length=8)

class RenterInDB(RenterBase):
    renter_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
