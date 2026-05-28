
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    renter_id: UUID

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class CarBase(BaseModel):
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]

class CarCreate(CarBase):
    vin: str
    license_plate: str
    description: str
    current_location_id: UUID

class Car(CarBase):
    car_id: UUID

    class Config:
        orm_mode = True

class CarDetails(Car):
    vin: str
    license_plate: str
    description: str
    current_location_id: UUID

class BookingBase(BaseModel):
    car_id: UUID
    start_date: date
    end_date: date
    pickup_location_id: UUID

class BookingCreate(BookingBase):
    renter_id: UUID

class Booking(BookingBase):
    rental_id: UUID
    renter_id: UUID
    total_price: float
    payment_status: str
    rental_status: str

    class Config:
        orm_mode = True

class PaymentBase(BaseModel):
    rental_id: UUID
    amount: float

class PaymentCreate(PaymentBase):
    payment_token: str

class Payment(PaymentBase):
    transaction_id: str
    payment_status: str

    class Config:
        orm_mode = True

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    sender_id: UUID
    recipient_id: UUID

class Message(MessageBase):
    message_id: UUID
    sender_id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True
