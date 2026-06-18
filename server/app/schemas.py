from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import List, Optional


# Auth schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GuideResponse(BaseModel):
    guide_id: str
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    guide: GuideResponse


# Booking schemas
class BookingResponse(BaseModel):
    booking_id: str
    guide_id: str
    client_name: str
    client_contact: str
    trek_name: str
    trek_date: date
    participants: int
    payment_status: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookingCreateRequest(BaseModel):
    client_name: str
    client_contact: str
    trek_name: str
    trek_date: date
    participants: int = 1


class BookingUpdateRequest(BaseModel):
    participants: Optional[int] = None
    payment_status: Optional[str] = None
    status: Optional[str] = None
    client_name: Optional[str] = None
    client_contact: Optional[str] = None
    trek_name: Optional[str] = None
    trek_date: Optional[date] = None


# Availability schemas
class AvailabilityResponse(BaseModel):
    availability_id: str
    guide_id: str
    date: date
    is_available: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AvailabilityCreateRequest(BaseModel):
    dates: Optional[List[date]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_available: bool
    notes: Optional[str] = None


class AvailabilityCreateResponse(BaseModel):
    status: str
    updated_count: int


# Notification schemas
class NotificationResponse(BaseModel):
    notification_id: str
    guide_id: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationReadResponse(BaseModel):
    notification_id: str
    is_read: bool
