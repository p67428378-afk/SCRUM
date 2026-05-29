from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class Renter(BaseModel):
    renter_id: UUID
    username: str
    email: str

    class Config:
        orm_mode = True

class CarOwner(BaseModel):
    owner_id: UUID
    username: str
    email: str

    class Config:
        orm_mode = True

class Car(BaseModel):
    car_id: UUID
    owner_id: UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]
    description: str
    vin: str
    license_plate: str
    current_location_id: UUID

    class Config:
        orm_mode = True

class Location(BaseModel):
    location_id: UUID
    address: str

    class Config:
        orm_mode = True

class Rental(BaseModel):
    rental_id: UUID
    car_id: UUID
    renter_id: UUID
    pickup_location_id: UUID
    start_date: datetime
    end_date: datetime
    total_price: float
    payment_status: str
    rental_status: str

    class Config:
        orm_mode = True

class Message(BaseModel):
    message_id: UUID
    rental_id: UUID
    sender_id: UUID
    recipient_id: UUID
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class BookingCreate(BaseModel):
    car_id: UUID
    start_date: str
    end_date: str
    pickup_location_id: UUID
    renter_id: UUID

class PaymentCreate(BaseModel):
    rental_id: UUID
    amount: float
    payment_token: str
