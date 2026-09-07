from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class WeatherRecordCreate(BaseModel):
    location_id: str
    temperature_celsius: float
    humidity_percent: float = Field(..., ge=0.0, le=100.0)
    wind_speed_mph: float = Field(..., ge=0.0)
    wind_direction: Optional[str] = None
    precipitation_inches: float = Field(0.0, ge=0.0)
    pressure_hpa: float
    uv_index: float = Field(0.0, ge=0.0)
    recorded_at: Optional[datetime] = None


class WeatherRecordResponse(BaseModel):
    id: str
    location_id: str
    temperature_celsius: float
    humidity_percent: float
    wind_speed_mph: float
    wind_direction: Optional[str] = None
    precipitation_inches: float
    pressure_hpa: float
    uv_index: float
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
