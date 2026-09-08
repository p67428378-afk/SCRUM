from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# --- User & Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    household_address: Optional[str] = None
    role: Optional[str] = "Resident"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    household_address: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    household_address: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


# --- Facility Schemas ---
class FacilityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    capacity: int = 50
    hourly_rate: float = 0.0
    is_active: bool = True


class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    hourly_rate: Optional[float] = None
    is_active: Optional[bool] = None


class FacilityResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    capacity: int
    hourly_rate: float
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Booking Schemas ---
class BookingCreate(BaseModel):
    facility_id: str
    booking_date: str  # YYYY-MM-DD
    start_time: str  # HH:MM:SS or HH:MM
    end_time: str  # HH:MM:SS or HH:MM
    purpose: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    facility_id: str
    resident_id: str
    booking_date: str
    start_time: str
    end_time: str
    purpose: Optional[str] = None
    status: str
    created_at: datetime
    facility: Optional[FacilityResponse] = None
    resident: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- Announcement Schemas ---
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    urgency: Optional[str] = "Info"  # Info, Warning, Emergency


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    urgency: Optional[str] = None
    is_archived: Optional[bool] = None


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    urgency: str
    author_id: str
    is_archived: bool
    created_at: datetime
    author: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- Service Request Schemas ---
class ServiceRequestCreate(BaseModel):
    title: str
    category: str  # Plumbing, Electrical, Public Maintenance
    description: str


class ServiceRequestUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # Open, In Progress, Resolved
    assigned_staff_id: Optional[str] = None


class ServiceRequestResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    status: str
    resident_id: str
    assigned_staff_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resident: Optional[UserResponse] = None
    assigned_staff: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
