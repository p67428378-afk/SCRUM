"""
Module: weather
Purpose: Router for weather-related endpoints.
Author: Backend Developer Agent
Created: 2026-06-19
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import CurrentWeatherResponse, WeatherForecastResponse, WeatherInsightsResponse
from server.services import weather_service

router = APIRouter(prefix="/api/v1/weather", tags=["weather"])

@router.get("/current", response_model=CurrentWeatherResponse)
def get_current_weather(
    location: str = Query(..., description="City name or zip code"),
    db: Session = Depends(get_db)
):
    """Fetch current weather conditions for a specified location."""
    if not location or not location.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location parameter is missing or invalid"
        )
    current_data, _, _ = weather_service.get_weather(db, location)
    return current_data

@router.get("/forecast", response_model=WeatherForecastResponse)
def get_weather_forecast(
    location: str = Query(..., description="City name or zip code"),
    days: int = Query(5, description="Number of forecast days"),
    db: Session = Depends(get_db)
):
    """Fetch 5-day weather forecast for a specified location."""
    if not location or not location.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location parameter is missing or invalid"
        )
    _, forecast_data, _ = weather_service.get_weather(db, location)
    return forecast_data

@router.get("/insights", response_model=WeatherInsightsResponse)
def get_weather_insights(
    location: str = Query(..., description="City name or zip code"),
    db: Session = Depends(get_db)
):
    """Fetch AI-generated daily insights and 6-hour temperature trend for a location."""
    if not location or not location.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location parameter is missing or invalid"
        )
    _, _, insights_data = weather_service.get_weather(db, location)
    return insights_data
