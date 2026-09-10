import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class TransferCreate(BaseModel):
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    amount: Decimal = Field(
        ..., gt=0, description="Transfer amount in USD, must be greater than 0"
    )

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2)


class TransferResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            uuid.UUID: lambda u: str(u),
            Decimal: lambda d: float(d),
            datetime: lambda dt: dt.isoformat(),
        },
    }

    @field_validator("amount", mode="before")
    @classmethod
    def convert_amount(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v
