from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class WeatherRecordCreate(BaseModel):
    location_id: str
    temperature_celsius: float = 0.0
    humidity_percent: Optional[float] = Field(0.0, ge=0.0, le=100.0)
    wind_speed_mph: Optional[float] = Field(0.0, ge=0.0)
    wind_direction: Optional[str] = "N"
    precipitation_inches: Optional[float] = Field(0.0, ge=0.0)
    pressure_hpa: Optional[float] = 1013.25
    uv_index: Optional[float] = Field(0.0, ge=0.0)
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
