from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LocationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: float
    longitude: float
    elevation_meters: Optional[float] = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation_meters: Optional[float] = None
    status: Optional[str] = None


class LocationResponse(LocationBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    last_record_at: Optional[datetime] = None

    class Config:
        from_attributes = True
