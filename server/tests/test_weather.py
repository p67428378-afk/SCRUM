"""
Module: test_weather
Purpose: Unit tests for weather-related endpoints.
Author: Backend Developer Agent
Created: 2026-06-19
"""

def test_get_current_weather_success(client):
    # AC: Display Current Weather Conditions: temperature, humidity, wind speed and direction, and brief description
    response = client.get("/api/v1/weather/current?location=London")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "location" in data
    assert data["location"]["name"] == "London"
    assert "temp_c" in data["current"]
    assert "temp_f" in data["current"]
    assert "humidity" in data["current"]
    assert "wind_kph" in data["current"]
    assert "condition" in data["current"]

def test_get_current_weather_missing_location(client):
    # AC: Error Handling and User Feedback: Clear error messages for invalid locations or missing parameters
    response = client.get("/api/v1/weather/current?location=")
    assert response.status_code == 400
    assert "detail" in response.json()

def test_get_weather_forecast_success(client):
    # AC: Display Weather Forecast: 5-day forecast with high/low temperatures and weather description
    response = client.get("/api/v1/weather/forecast?location=London")
    assert response.status_code == 200
    data = response.json()
    assert "forecast" in data
    assert "location" in data
    assert len(data["forecast"]) == 5
    for day in data["forecast"]:
        assert "date" in day
        assert "temp_high_c" in day
        assert "temp_low_c" in day
        assert "condition" in day

def test_get_weather_insights_success(client):
    # AC: Display Weather Forecast: Handle unavailable forecast data and invalid/ambiguous locations gracefully
    response = client.get("/api/v1/weather/insights?location=London")
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert "trend" in data
    assert len(data["trend"]) == 6
