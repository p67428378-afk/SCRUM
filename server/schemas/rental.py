
from pydantic import BaseModel
from datetime import datetime
import uuid

class BookingCreate(BaseModel):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    pickup_location_id: uuid.UUID

class BookingResponse(BaseModel):
    rental_id: uuid.UUID
    total_price: float
    rental_status: str
    payment_status: str

    class Config:
        orm_mode = True

class BookingDetails(BaseModel):
    rental_id: uuid.UUID
    car_id: uuid.UUID
    renter_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    total_price: float
    payment_status: str
    rental_status: str
    pickup_location_id: uuid.UUID

    class Config:
        orm_mode = True
