import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TransferCreate(BaseModel):
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    amount: Decimal = Field(gt=0, description="Transfer amount must be greater than 0")

    model_config = ConfigDict(from_attributes=True)


class TransferResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AccountResponse(BaseModel):
    id: uuid.UUID
    account_name: str
    balance: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
