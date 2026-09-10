from datetime import datetime, time
from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_serializer


# --- Schedule Schemas ---
class StaffScheduleBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: Union[time, str] = Field(..., description="HH:MM string or time object")
    end_time: Union[time, str] = Field(..., description="HH:MM string or time object")
    break_start: Optional[Union[time, str]] = Field(
        None, description="HH:MM string or time object"
    )
    break_end: Optional[Union[time, str]] = Field(
        None, description="HH:MM string or time object"
    )

    @field_serializer("start_time", "end_time", "break_start", "break_end")
    def serialize_time(self, v: Optional[Union[time, str]], _info) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, time):
            return v.strftime("%H:%M")
        return str(v)


class StaffScheduleCreate(StaffScheduleBase):
    pass


class StaffScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    staff_id: str
    day_of_week: int
    start_time: Union[time, str]
    end_time: Union[time, str]
    break_start: Optional[Union[time, str]] = None
    break_end: Optional[Union[time, str]] = None

    @field_serializer("start_time", "end_time", "break_start", "break_end")
    def serialize_time(self, v: Optional[Union[time, str]], _info) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, time):
            return v.strftime("%H:%M")
        return str(v)


# --- Service Schemas ---
class ServiceBase(BaseModel):
    name: str
    duration_minutes: int = Field(..., gt=0)
    price: float = Field(..., ge=0)
    loyalty_points_earned: int = Field(10, ge=0)


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, gt=0)
    price: Optional[float] = Field(None, ge=0)
    loyalty_points_earned: Optional[int] = Field(None, ge=0)


class ServiceResponse(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# --- Staff Schemas ---
class StaffBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    is_active: bool = True


class StaffCreate(StaffBase):
    working_hours: Optional[List[StaffScheduleCreate]] = None
    service_ids: Optional[List[str]] = None


class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    service_ids: Optional[List[str]] = None
    working_hours: Optional[List[StaffScheduleCreate]] = None


class StaffResponse(StaffBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    services: List[ServiceResponse] = []
    schedules: List[StaffScheduleResponse] = []


# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    preferred_staff_id: Optional[str] = None
    notes: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_staff_id: Optional[str] = None
    notes: Optional[str] = None


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    loyalty_points: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# --- Appointment Schemas ---
class AppointmentCreate(BaseModel):
    customer_id: str
    staff_id: str
    service_id: str
    start_time: datetime


class AppointmentCancel(BaseModel):
    reason: Optional[str] = "Client cancellation"


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_id: str
    staff_id: str
    service_id: str
    start_time: datetime
    end_time: datetime
    status: str
    cancellation_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    customer: Optional[CustomerResponse] = None
    staff: Optional[StaffResponse] = None
    service: Optional[ServiceResponse] = None


class AvailableSlotResponse(BaseModel):
    start_time: datetime
    end_time: datetime
    staff_id: str
    staff_name: Optional[str] = None
    service_id: Optional[str] = None


class AvailableSlotsListResponse(BaseModel):
    slots: List[AvailableSlotResponse]


# --- Loyalty Schemas ---
class LoyaltyTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_id: str
    appointment_id: Optional[str] = None
    points_change: int
    transaction_type: str
    description: Optional[str] = None
    created_at: datetime


class LoyaltyRedeemRequest(BaseModel):
    points: int = Field(..., gt=0)
    description: Optional[str] = "Loyalty points redemption"


class CustomerHistoryResponse(BaseModel):
    customer: CustomerResponse
    total_visits: int
    appointments: List[AppointmentResponse]
    loyalty_transactions: List[LoyaltyTransactionResponse]
