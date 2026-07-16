from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: EmailStr


class UserCreate(UserBase):
    password: str
    role: Optional[str] = "Receptionist"


class UserUpdateRole(BaseModel):
    role: str


class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
