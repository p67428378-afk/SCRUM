from pydantic import BaseModel, EmailStr, Field as PydanticField
from typing import Optional, List


# User / Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Optional[str] = "farm_manager"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Field & Crop Cycle Schemas
class FieldCreate(BaseModel):
    name: str
    acreage: float = PydanticField(..., gt=0, description="Field acreage in acres")
    location_gis: Optional[str] = None
    soil_type: Optional[str] = None


class CropCycleCreate(BaseModel):
    field_id: str
    crop_type: str
    planting_date: str
    target_harvest_date: Optional[str] = None
    soil_health_notes: Optional[str] = None
    status: Optional[str] = "PLANTED"


class CropCycleResponse(BaseModel):
    id: str
    field_id: str
    crop_type: str
    planting_date: str
    target_harvest_date: Optional[str] = None
    soil_health_notes: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class FieldResponse(BaseModel):
    id: str
    name: str
    acreage: float
    location_gis: Optional[str] = None
    soil_type: Optional[str] = None
    crop_cycles: List[CropCycleResponse] = []

    class Config:
        from_attributes = True


# Livestock & Health Record / Feeding Log Schemas
class LivestockCreate(BaseModel):
    tag_number: str
    species: str
    breed: Optional[str] = None
    birth_date: Optional[str] = None
    status: Optional[str] = "HEALTHY"


class HealthRecordCreate(BaseModel):
    livestock_id: Optional[str] = None
    event_type: str
    event_date: str
    medication_name: str
    next_due_date: Optional[str] = None
    notes: Optional[str] = None


class HealthRecordResponse(BaseModel):
    id: str
    livestock_id: str
    event_type: str
    event_date: str
    medication_name: str
    next_due_date: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class FeedingLogCreate(BaseModel):
    livestock_id: Optional[str] = None
    feed_type: str
    quantity: float = PydanticField(..., gt=0)
    unit: Optional[str] = "kg"
    feeding_time: str
    notes: Optional[str] = None


class FeedingLogResponse(BaseModel):
    id: str
    livestock_id: str
    feed_type: str
    quantity: float
    unit: str
    feeding_time: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class LivestockResponse(BaseModel):
    id: str
    tag_number: str
    species: str
    breed: Optional[str] = None
    birth_date: Optional[str] = None
    status: str
    health_records: List[HealthRecordResponse] = []
    feeding_logs: List[FeedingLogResponse] = []

    class Config:
        from_attributes = True


# Equipment & Maintenance Schemas
class EquipmentCreate(BaseModel):
    name: str
    serial_number: str
    operating_hours: float = 0.0
    status: Optional[str] = "OPERATIONAL"
    last_service_date: Optional[str] = None
    maintenance_threshold_hours: float = 500.0


class MaintenanceLogCreate(BaseModel):
    equipment_id: Optional[str] = None
    service_date: str
    operating_hours_logged: float = 0.0
    service_type: str
    description: Optional[str] = None
    cost: float = 0.0


class MaintenanceLogResponse(BaseModel):
    id: str
    equipment_id: str
    service_date: str
    operating_hours_logged: float
    service_type: str
    description: Optional[str] = None
    cost: float

    class Config:
        from_attributes = True


class EquipmentResponse(BaseModel):
    id: str
    name: str
    serial_number: str
    operating_hours: float
    status: str
    last_service_date: Optional[str] = None
    maintenance_threshold_hours: float
    maintenance_logs: List[MaintenanceLogResponse] = []

    class Config:
        from_attributes = True


# Inventory Schemas
class InventoryItemCreate(BaseModel):
    item_name: str
    category: str
    quantity: float = PydanticField(
        ..., ge=0, description="Quantity must be non-negative"
    )
    unit: str
    reorder_threshold: float = 10.0


class StockAdjustment(BaseModel):
    quantity_delta: Optional[float] = None
    new_quantity: Optional[float] = None
    reason_notes: Optional[str] = None


class InventoryItemResponse(BaseModel):
    id: str
    item_name: str
    category: str
    quantity: float
    unit: str
    reorder_threshold: float

    class Config:
        from_attributes = True


# Operational Alert & Dashboard Schemas
class OperationalAlertResponse(BaseModel):
    id: str
    alert_type: str
    severity: str
    message: str
    is_resolved: bool

    class Config:
        from_attributes = True


class DashboardSummaryResponse(BaseModel):
    active_crop_cycles: int
    livestock_headcount: int
    equipment_operating: int
    low_inventory_count: int
    alerts: List[OperationalAlertResponse]
