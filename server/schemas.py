from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CarAvailability(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: List[str]

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
    description: str
    image_urls: List[str]

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

class PaymentCreate(BaseModel):
    rental_id: uuid.UUID
    amount: float
    payment_token: str

class PaymentResponse(BaseModel):
    transaction_id: str
    payment_status: str

class BookingConfirmation(BaseModel):
    rental_id: uuid.UUID
    car_id: uuid.UUID
    renter_id: uuid.UUID
    pickup_location_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    total_price: float
    payment_status: str
    rental_status: str

class Message(BaseModel):
    message_id: uuid.UUID
    rental_id: uuid.UUID
    sender_id: uuid.UUID
    recipient_id: uuid.UUID
    content: str
    timestamp: datetime