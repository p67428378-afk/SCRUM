
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Car(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]

    class Config:
        orm_mode = True

class CarDetails(Car):
    description: str
    vin: str
    license_plate: str
    current_location_id: uuid.UUID

    class Config:
        orm_mode = True

class BookingCreate(BaseModel):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime.datetime
    end_date: datetime.datetime

class Booking(BaseModel):
    rental_id: uuid.UUID
    payment_status: str
    rental_status: str
    total_price: float

    class Config:
        orm_mode = True

class Payment(BaseModel):
    rental_id: uuid.UUID
    amount: float
    payment_token: str

class PaymentStatus(BaseModel):
    transaction_id: str
    payment_status: str

class BookingDetails(Booking):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime.datetime
    end_date: datetime.datetime

    class Config:
        orm_mode = True
