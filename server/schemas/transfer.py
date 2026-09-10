from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class TransferCreate(BaseModel):
    sender_id: UUID = Field(..., description="UUID of the sender account")
    receiver_id: UUID = Field(..., description="UUID of the receiver account")
    amount: float = Field(..., gt=0, description="Positive transfer amount in USD")


class TransferResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    amount: float
    status: Literal["COMPLETED", "BLOCKED", "FAILED"] = "COMPLETED"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HTTPError(BaseModel):
    detail: str
