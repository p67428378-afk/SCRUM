
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Car Schemas
class CarAvailability(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]

    class Config:
        orm_mode = True

class CarDetails(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    vin: str
    license_plate: str
    current_location_id: uuid.UUID
    description: Optional[str] = None
    image_urls: List[str]

    class Config:
        orm_mode = True

# Booking Schemas
class BookingCreate(BaseModel):
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime
    end_date: datetime

class BookingResponse(BaseModel):
    rental_id: uuid.UUID
    payment_status: str
    rental_status: str
    total_price: float

    class Config:
        orm_mode = True

class BookingDetails(BaseModel):
    rental_id: uuid.UUID
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    total_price: float
    payment_status: str
    rental_status: str

    class Config:
        orm_mode = True

# Payment Schemas
class Payment(BaseModel):
    rental_id: uuid.UUID
    amount: float
    payment_token: str

class PaymentResponse(BaseModel):
    transaction_id: str
    payment_status: str

# Chat Schemas
class Message(BaseModel):
    rental_id: uuid.UUID
    sender_id: uuid.UUID
    recipient_id: uuid.UUID
    content: str

class MessageResponse(BaseModel):
    message_id: uuid.UUID
    timestamp: datetime

