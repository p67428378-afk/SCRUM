from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TransferCreate(BaseModel):
    sender_id: str = Field(..., min_length=1, description="Sender user or account ID")
    receiver_id: str = Field(
        ..., min_length=1, description="Receiver user or account ID"
    )
    amount: float = Field(
        ..., gt=0, description="Transfer amount in USD (must be positive)"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sender_id": "usr_12345",
                "receiver_id": "usr_98765",
                "amount": 250.00,
            }
        }
    )


class TransferResponse(BaseModel):
    id: str = Field(..., description="Unique transfer UUID")
    sender_id: str = Field(..., description="Sender ID")
    receiver_id: str = Field(..., description="Receiver ID")
    amount: float = Field(..., description="Transfer amount")
    status: str = Field(..., description="Transfer status (e.g., COMPLETED)")
    created_at: datetime = Field(
        ..., description="Timestamp when transfer was initiated"
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when transfer was last updated"
    )

    model_config = ConfigDict(from_attributes=True)


class AccountResponse(BaseModel):
    id: str = Field(..., description="Account identifier")
    balance: float = Field(..., description="Current available balance")
    email: Optional[str] = Field(None, description="Email associated with the account")
    role: str = Field("user", description="User role")

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Detailed error message")
