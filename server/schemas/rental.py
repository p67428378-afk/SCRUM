
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class RentalBase(BaseModel):
    car_id: UUID
    renter_id: UUID
    pickup_location_id: UUID
    start_date: datetime
    end_date: datetime

class RentalCreate(RentalBase):
    pass

class Rental(BaseModel):
    rental_id: UUID
    rental_status: str
    payment_status: str
    total_price: Decimal

    class Config:
        orm_mode = True

class RentalConfirmation(Rental):
    car_id: UUID
    renter_id: UUID
    start_date: datetime
    end_date: datetime
    pickup_location_id: UUID

    class Config:
        orm_mode = True
