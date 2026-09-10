from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class TransferCreate(BaseModel):
    sender_id: UUID = Field(..., description="Sender account UUID")
    receiver_id: UUID = Field(..., description="Receiver account UUID")
    amount: float = Field(
        ..., gt=0, description="Transfer amount in USD, must be greater than 0"
    )


class TransferResponse(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HTTPErrorResponse(BaseModel):
    detail: str
