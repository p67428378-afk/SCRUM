from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class CitizenBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None


class CitizenCreate(CitizenBase):
    pass


class CitizenResponse(CitizenBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
