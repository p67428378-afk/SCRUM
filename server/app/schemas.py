from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# User Schemas
class UserRegister(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    full_name: str
    preferred_language: Optional[str] = "Hindi"
    address: Optional[str] = None


class UserLogin(BaseModel):
    identifier: str  # email or phone
    password: str


class UserOut(BaseModel):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: str
    role: str
    preferred_language: str
    address: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# Pooja Schemas
class PoojaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    duration_minutes: int = Field(30, gt=0)


class PoojaOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    is_active: bool

    class Config:
        from_attributes = True


class PoojaSlotCreate(BaseModel):
    pooja_id: str
    slot_date: date
    start_time: time
    end_time: time
    max_capacity: int = Field(10, gt=0)


class PoojaSlotOut(BaseModel):
    id: str
    pooja_id: str
    slot_date: date
    start_time: time
    end_time: time
    max_capacity: int
    booked_count: int
    pooja: Optional[PoojaOut] = None

    class Config:
        from_attributes = True


# Booking Schemas
class BookingCreate(BaseModel):
    slot_id: str
    devotee_name: str
    devotee_phone: Optional[str] = None
    gotra: Optional[str] = None
    nakshatra: Optional[str] = None
    booking_type: Optional[str] = "Online"  # 'Online' or 'Offline'


class BookingOut(BaseModel):
    id: str
    booking_reference: str
    user_id: str
    slot_id: str
    devotee_name: str
    devotee_phone: Optional[str] = None
    gotra: Optional[str] = None
    nakshatra: Optional[str] = None
    booking_type: str
    status: str
    amount_paid: float
    created_at: datetime
    slot: Optional[PoojaSlotOut] = None

    class Config:
        from_attributes = True


# Donation Schemas
class DonationCreate(BaseModel):
    donor_name: str
    donor_email: Optional[EmailStr] = None
    donor_phone: Optional[str] = None
    donor_pan: Optional[str] = None
    amount: float = Field(..., gt=0)
    payment_method: Optional[str] = "UPI"  # 'Cash', 'UPI', 'Card', 'NetBanking'
    tax_exemption_80g: Optional[bool] = True
    purpose: Optional[str] = "Temple Renovation & Seva"


class DonationOut(BaseModel):
    id: str
    receipt_number: str
    user_id: Optional[str] = None
    donor_name: str
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_pan: Optional[str] = None
    amount: float
    payment_method: str
    tax_exemption_80g: bool
    purpose: str
    created_at: datetime

    class Config:
        from_attributes = True


# Announcement Schemas
class AnnouncementCreate(BaseModel):
    title: str
    message: str


class AnnouncementOut(BaseModel):
    id: str
    title: str
    message: str
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Admin Dashboard Schemas
class DashboardSummaryOut(BaseModel):
    daily_bookings_count: int
    total_collections: float
    expected_devotees: int
    active_rituals: int
    recent_bookings: List[BookingOut]
    recent_donations: List[DonationOut]


class FinancialReportOut(BaseModel):
    total_donations_amount: float
    total_bookings_amount: float
    total_revenue: float
    donations_count: int
    bookings_count: int
    payment_methods_summary: dict
