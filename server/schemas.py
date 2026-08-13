from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr


# --- AUTH & USER ---
class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str
    role: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "Front Desk Staff"  # Admin, Front Desk Staff, Housekeeping


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- ROOM ---
class RoomCreate(BaseModel):
    room_number: str
    room_type: str  # Standard, Deluxe, Suite
    capacity: int = 2
    base_rate_per_night: float
    status: str = "Available"  # Available, Occupied, Cleaning, Maintenance


class RoomUpdate(BaseModel):
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    base_rate_per_night: Optional[float] = None
    status: Optional[str] = None


class RoomResponse(BaseModel):
    id: UUID
    room_number: str
    room_type: str
    capacity: int
    base_rate_per_night: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- GUEST ---
class GuestCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    id_proof_number: Optional[str] = None


class GuestUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    id_proof_number: Optional[str] = None


class GuestResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    id_proof_number: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- RESERVATION ---
class ReservationCreate(BaseModel):
    room_id: UUID
    guest_id: Optional[UUID] = None
    # Option to provide guest details directly if guest doesn't exist yet
    guest_full_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None
    guest_phone: Optional[str] = None
    guest_id_proof_number: Optional[str] = None

    check_in_date: date
    check_out_date: date
    number_of_guests: int = 1


class ReservationUpdate(BaseModel):
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    number_of_guests: Optional[int] = None
    room_id: Optional[UUID] = None
    status: Optional[str] = None  # Confirmed, Checked-In, Checked-Out, Cancelled


class ReservationResponse(BaseModel):
    id: UUID
    room_id: UUID
    guest_id: UUID
    check_in_date: date
    check_out_date: date
    number_of_guests: int
    total_amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    room: Optional[RoomResponse] = None
    guest: Optional[GuestResponse] = None

    model_config = ConfigDict(from_attributes=True)


class AvailabilityQuery(BaseModel):
    check_in_date: date
    check_out_date: date
    number_of_guests: Optional[int] = 1
    room_type: Optional[str] = None


class AvailabilityResponse(BaseModel):
    check_in_date: date
    check_out_date: date
    available_rooms: List[RoomResponse]


# --- FOLIO ---
class FolioResponse(BaseModel):
    id: UUID
    reservation_id: UUID
    room_charges: float
    tax_amount: float
    total_due: float
    payment_status: str
    payment_method: Optional[str] = None
    key_card_assigned: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CheckInRequest(BaseModel):
    key_card_assigned: Optional[str] = "KEY-001"


class CheckOutRequest(BaseModel):
    payment_method: str = "Credit Card"  # Credit Card, Cash, Debit


# --- DASHBOARD ---
class DashboardMetricsResponse(BaseModel):
    occupancy_rate: float  # Percentage (e.g. 85.0)
    total_rooms: int
    occupied_rooms: int
    available_rooms: int
    cleaning_rooms: int
    maintenance_rooms: int
    pending_checkins: int  # Daily arrivals scheduled for today
    scheduled_checkouts: int  # Daily departures scheduled for today
    housekeeping_queue: int  # Rooms requiring cleaning
    daily_revenue: float  # Total revenue from paid/completed stays today
