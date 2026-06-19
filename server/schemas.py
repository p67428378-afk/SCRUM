"""
Module: schemas
Purpose: Pydantic schemas for request/response validation.
Author: Backend Developer Agent
Created: 2026-06-19
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Weather Schemas ---

class CurrentWeatherDetails(BaseModel):
    condition: str
    condition_icon: str
    humidity: float
    pressure_mb: float
    temp_c: float
    temp_f: float
    updated_at: str
    uv: float
    wind_dir: str
    wind_kph: float

class LocationDetails(BaseModel):
    country: str
    lat: float
    lon: float
    name: str
    timezone: str

class CurrentWeatherResponse(BaseModel):
    current: CurrentWeatherDetails
    location: LocationDetails


class ForecastDayDetails(BaseModel):
    condition: str
    condition_icon: str
    date: str
    rain_probability: float
    temp_high_c: float
    temp_high_f: float
    temp_low_c: float
    temp_low_f: float

class ForecastLocationDetails(BaseModel):
    country: str
    name: str

class WeatherForecastResponse(BaseModel):
    forecast: List[ForecastDayDetails]
    location: ForecastLocationDetails


class TrendDetails(BaseModel):
    temp_c: float
    temp_f: float
    time: str

class WeatherInsightsResponse(BaseModel):
    insights: str
    trend: List[TrendDetails]


# --- Location Schemas ---

class LocationBase(BaseModel):
    name: str
    country: Optional[str] = None
    is_default: bool = False

class LocationCreate(LocationBase):
    pass

class LocationResponse(BaseModel):
    id: str
    name: str
    country: Optional[str] = None
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LocationDefaultResponse(BaseModel):
    id: str
    is_default: bool
    name: str

    model_config = ConfigDict(from_attributes=True)

class DeleteResponse(BaseModel):
    success: bool
