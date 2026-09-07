from datetime import date
from typing import List, Optional
from pydantic import BaseModel


class ForecastDay(BaseModel):
    forecast_date: date
    temp_min_celsius: float
    temp_max_celsius: float
    precipitation_probability: float
    wind_speed_mph: float
    condition_text: Optional[str] = "Sunny"

    class Config:
        from_attributes = True


class ForecastHour(BaseModel):
    forecast_date: date
    forecast_hour: int
    temp_min_celsius: float
    temp_max_celsius: float
    precipitation_probability: float
    wind_speed_mph: float
    condition_text: Optional[str] = "Sunny"

    class Config:
        from_attributes = True


class ForecastResponse(BaseModel):
    location_id: str
    daily: List[ForecastDay]
    hourly: List[ForecastHour]
