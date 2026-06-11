from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

class CarBase(BaseModel):
    owner_id: uuid.UUID
    make: str = Field(..., min_length=2)
    model: str = Field(..., min_length=2)
    year: int = Field(..., gt=1900, lt=2100)
    vin: str = Field(..., min_length=17, max_length=17)
    license_plate: str = Field(..., min_length=5, max_length=10)
    daily_rate: float = Field(..., gt=0)
    status: str = Field(..., pattern="^(available|rented|maintenance)$")
    image_urls: Optional[List[str]] = None
    description: Optional[str] = None
    current_location_id: Optional[uuid.UUID] = None

class CarCreate(CarBase):
    pass

class CarUpdate(CarBase):
    owner_id: Optional[uuid.UUID] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    license_plate: Optional[str] = None
    daily_rate: Optional[float] = None
    status: Optional[str] = None

class CarInDB(CarBase):
    car_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CarAvailability(BaseModel):
    car_id: uuid.UUID
    make: str
    model: str
    year: int
    daily_rate: float
    status: str
    image_urls: Optional[List[str]] = None

    class Config:
        from_attributes = True
