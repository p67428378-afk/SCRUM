import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class AccountCreate(BaseModel):
    user_id: Optional[uuid.UUID] = None
    account_number: Optional[str] = None
    initial_balance: Decimal = Field(default=Decimal("1000.00"), ge=0)
    currency: str = "USD"


class AccountResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    account_number: str
    balance: float
    currency: str
    status: str
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            uuid.UUID: lambda u: str(u),
            Decimal: lambda d: float(d),
            datetime: lambda dt: dt.isoformat(),
        },
    }


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    role: str
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
    }
