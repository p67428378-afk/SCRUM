import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class TransferCreate(BaseModel):
    sender_id: str = Field(..., description="UUID v4 of the sender account")
    receiver_id: str = Field(..., description="UUID v4 of the receiver account")
    amount: float = Field(..., gt=0, description="Positive transfer amount in USD")

    @field_validator("sender_id", "receiver_id")
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        try:
            uuid.UUID(str(v))
        except (ValueError, AttributeError, TypeError):
            raise ValueError("Invalid UUID format for sender_id or receiver_id")
        return str(v)


class TransferResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AccountResponse(BaseModel):
    id: str
    account_number: str
    balance: float
    owner_name: str
    email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HTTPError(BaseModel):
    detail: str
