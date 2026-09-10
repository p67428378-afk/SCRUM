from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AccountBase(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=100)
    balance: Decimal = Field(default=Decimal("0.00"), ge=0)


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    user_name: str | None = None
    balance: Decimal | None = None


class AccountResponse(BaseModel):
    id: UUID
    user_name: str
    balance: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
