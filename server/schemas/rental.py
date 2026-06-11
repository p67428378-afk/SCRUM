from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field

class RentalBase(BaseModel):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    total_price: float = Field(..., gt=0)
    payment_status: str = Field(..., pattern="^(pending|paid|failed)$")
    rental_status: str = Field(..., pattern="^(booked|active|completed|cancelled)$")

class RentalCreate(BaseModel):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime
    end_date: datetime

class RentalInDB(RentalBase):
    rental_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
