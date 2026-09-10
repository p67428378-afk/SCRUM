from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class TransferCreate(BaseModel):
    sender_id: str = Field(..., description="Sender account or user ID")
    receiver_id: str = Field(..., description="Receiver account or user ID / handle")
    amount: Decimal = Field(..., description="Transfer amount in USD")


class TransferResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AccountResponse(BaseModel):
    id: str
    user_id: str
    account_number: str
    account_type: str
    balance: float
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    handle: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    accounts: List[AccountResponse] = []

    model_config = ConfigDict(from_attributes=True)


class BalanceResponse(BaseModel):
    user_id: str
    available_balance: float
    currency: str = "USD"
    account_number: Optional[str] = None


class DepositRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Amount to deposit")
