from datetime import date
from typing import List, Optional
from pydantic import BaseModel, model_validator


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
    daily: List[ForecastDay] = []
    hourly: List[ForecastHour] = []
    daily_forecasts: Optional[List[ForecastDay]] = None
    hourly_forecasts: Optional[List[ForecastHour]] = None

    @model_validator(mode="after")
    def sync_forecast_aliases(self):
        if self.daily_forecasts is None:
            self.daily_forecasts = self.daily
        if not self.daily and self.daily_forecasts:
            self.daily = self.daily_forecasts
        if self.hourly_forecasts is None:
            self.hourly_forecasts = self.hourly
        if not self.hourly and self.hourly_forecasts:
            self.hourly = self.hourly_forecasts
        return self

    class Config:
        from_attributes = True
