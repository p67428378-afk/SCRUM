from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "Resident"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# PickupRequest Schemas
class PickupRequestCreate(BaseModel):
    waste_type: str
    address: str
    scheduled_date: str
    time_slot: str
    special_notes: Optional[str] = None


class PickupRequestResponse(PickupRequestCreate):
    id: str
    user_id: str
    tracking_code: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# WasteBin Schemas
class WasteBinCreate(BaseModel):
    serial_number: str
    location_address: str
    zone_code: str
    waste_type: str
    fill_level_pct: Optional[int] = 0


class WasteBinUpdate(BaseModel):
    location_address: Optional[str] = None
    zone_code: Optional[str] = None
    waste_type: Optional[str] = None
    fill_level_pct: Optional[int] = None
    status: Optional[str] = None


class TelemetryUpdate(BaseModel):
    fill_level_pct: int = Field(..., ge=0, le=100)


class WasteBinResponse(WasteBinCreate):
    id: str
    fill_level_pct: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# RouteTask Schemas
class RouteTaskCreate(BaseModel):
    bin_id: Optional[str] = None
    pickup_id: Optional[str] = None
    sequence_number: Optional[int] = 1


class RouteTaskUpdate(BaseModel):
    task_status: Optional[str] = None  # Pending, In Progress, Completed, Skipped
    collected_weight_kg: Optional[float] = None
    skip_reason: Optional[str] = None
    evidence_url: Optional[str] = None


class RouteTaskResponse(BaseModel):
    id: str
    route_id: str
    bin_id: Optional[str] = None
    pickup_id: Optional[str] = None
    sequence_number: int
    task_status: str
    collected_weight_kg: float
    skip_reason: Optional[str] = None
    evidence_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    bin: Optional[WasteBinResponse] = None

    class Config:
        from_attributes = True


# CollectionRoute Schemas
class CollectionRouteCreate(BaseModel):
    driver_id: Optional[str] = None
    route_name: str
    zone_code: str
    scheduled_date: str
    bin_ids: Optional[List[str]] = []
    pickup_ids: Optional[List[str]] = []


class CollectionRouteResponse(BaseModel):
    id: str
    driver_id: Optional[str] = None
    route_name: str
    zone_code: str
    scheduled_date: str
    status: str
    created_at: datetime
    updated_at: datetime
    tasks: List[RouteTaskResponse] = []

    class Config:
        from_attributes = True


# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_tonnage: float
    route_completion_pct: float
    sla_compliance_pct: float
    active_overflow_alerts: int
    tonnage_by_category: dict


class HeatmapData(BaseModel):
    zone_code: str
    total_bins: int
    avg_fill_level: float
    overflowing_bins: int
