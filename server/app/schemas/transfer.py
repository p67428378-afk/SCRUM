from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class TransferCreate(BaseModel):
    sender_id: UUID = Field(..., description="UUID of the sender account")
    receiver_id: UUID = Field(..., description="UUID of the receiver account")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Transfer amount, must be greater than 0")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sender_id": "550e8400-e29b-41d4-a716-446655440000",
                "receiver_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "amount": 250.00,
            }
        }
    )


class TransferResponse(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AccountResponse(BaseModel):
    id: UUID
    account_number: str
    balance: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
