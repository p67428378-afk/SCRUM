"""
Module: weather_service
Purpose: Service for fetching, caching, and generating weather data.
Author: Backend Developer Agent
Created: 2026-06-19
"""

import httpx
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.config import WEATHER_API_KEY, WEATHER_API_URL
from server.models import Location, WeatherCache

logger = logging.getLogger(__name__)

def get_or_create_location(db: Session, name: str) -> Location:
    """Get an existing location or create a new one."""
    normalized_name = name.strip().title()
    location = db.query(Location).filter(Location.name == normalized_name).first()
    if not location:
        # Default country to US or parse from name if comma separated
        country = "US"
        parts = name.split(",")
        if len(parts) > 1:
            normalized_name = parts[0].strip().title()
            country = parts[1].strip().upper()
        
        location = Location(name=normalized_name, country=country)
        db.add(location)
        db.commit()
        db.refresh(location)
    return location

def generate_mock_weather(location_name: str, country: str = "US"):
    """Generate realistic, deterministic mock weather data based on location name."""
    # Use hash of location name to make it deterministic but different per location
    loc_hash = sum(ord(c) for c in location_name)
    base_temp = 10.0 + (loc_hash % 20)  # 10 to 30 C
    humidity = 40 + (loc_hash % 50)     # 40 to 90%
    pressure = 1000 + (loc_hash % 25)   # 1000 to 1025 hPa
    wind_speed = 5.0 + (loc_hash % 25)  # 5 to 30 kph
    uv = 1 + (loc_hash % 10)
    
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    wind_dir = directions[loc_hash % len(directions)]
    
    conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy"]
    condition = conditions[loc_hash % len(conditions)]
    
    condition_icons = {
        "Sunny": "https://assets.weatherapi.com/weather/64x64/day/113.png",
        "Partly Cloudy": "https://assets.weatherapi.com/weather/64x64/day/116.png",
        "Cloudy": "https://assets.weatherapi.com/weather/64x64/day/119.png",
        "Rainy": "https://assets.weatherapi.com/weather/64x64/day/302.png",
        "Stormy": "https://assets.weatherapi.com/weather/64x64/day/389.png"
    }
    icon = condition_icons.get(condition, condition_icons["Sunny"])
    
    current_time_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    
    current_data = {
        "current": {
            "condition": condition,
            "condition_icon": icon,
            "humidity": float(humidity),
            "pressure_mb": float(pressure),
            "temp_c": float(base_temp),
            "temp_f": float(round(base_temp * 9/5 + 32, 1)),
            "updated_at": current_time_str,
            "uv": float(uv),
            "wind_dir": wind_dir,
            "wind_kph": float(wind_speed)
        },
        "location": {
            "country": country,
            "lat": 40.71 + (loc_hash % 10) / 100.0,
            "lon": -74.00 - (loc_hash % 10) / 100.0,
            "name": location_name,
            "timezone": "America/New_York"
        }
    }
    
    # Generate 5-day forecast
    forecast_list = []
    today = datetime.now(timezone.utc)
    for i in range(5):
        day_date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
        day_temp_high = base_temp + 3 - (i * 0.5) + (loc_hash % 3)
        day_temp_low = base_temp - 4 - (i * 0.5) - (loc_hash % 2)
        day_cond = conditions[(loc_hash + i) % len(conditions)]
        day_icon = condition_icons.get(day_cond, condition_icons["Sunny"])
        rain_prob = 10 + ((loc_hash + i * 17) % 80)
        
        forecast_list.append({
            "condition": day_cond,
            "condition_icon": day_icon,
            "date": day_date,
            "rain_probability": float(rain_prob),
            "temp_high_c": float(round(day_temp_high, 1)),
            "temp_high_f": float(round(day_temp_high * 9/5 + 32, 1)),
            "temp_low_c": float(round(day_temp_low, 1)),
            "temp_low_f": float(round(day_temp_low * 9/5 + 32, 1))
        })
        
    forecast_data = {
        "forecast": forecast_list,
        "location": {
            "country": country,
            "name": location_name
        }
    }
    
    # Generate insights and trend
    trend_list = []
    for h in range(6):
        hour_str = f"{(12 + h) % 12 or 12} {'PM' if (12 + h) >= 12 else 'AM'}"
        hour_temp = base_temp - (h * 0.8)
        trend_list.append({
            "temp_c": float(round(hour_temp, 1)),
            "temp_f": float(round(hour_temp * 9/5 + 32, 1)),
            "time": hour_str
        })
        
    insights_text = (
        f"Temperatures in {location_name} will gradually cool down through the afternoon. "
        f"Expect {condition.lower()} conditions. Good conditions for brief outdoor activities before evening."
    )
    
    insights_data = {
        "insights": insights_text,
        "trend": trend_list
    }
    
    return current_data, forecast_data, insights_data

def fetch_external_weather(location_name: str):
    """Fetch weather data from external API (WeatherAPI.com format)."""
    if not WEATHER_API_KEY:
        raise ValueError("API Key missing")
        
    # We can call WeatherAPI.com or OpenWeatherMap. Let's implement WeatherAPI.com format.
    # WeatherAPI.com endpoint: http://api.weatherapi.com/v1/forecast.json?key=KEY&q=LOCATION&days=5
    url = f"{WEATHER_API_URL}/forecast.json"
    params = {
        "key": WEATHER_API_KEY,
        "q": location_name,
        "days": 5,
        "aqi": "no"
    }
    
    response = httpx.get(url, params=params, timeout=10.0)
    if response.status_code == 400:
        raise HTTPException(status_code=400, detail="Location parameter is missing or invalid")
    elif response.status_code == 404:
        raise HTTPException(status_code=404, detail="Location not found")
    elif response.status_code != 200:
        raise HTTPException(status_code=503, detail="External weather service unavailable")
        
    data = response.json()
    
    # Map WeatherAPI.com response to our API contracts
    current_mapped = {
        "current": {
            "condition": data["current"]["condition"]["text"],
            "condition_icon": "https:" + data["current"]["condition"]["icon"],
            "humidity": float(data["current"]["humidity"]),
            "pressure_mb": float(data["current"]["pressure_mb"]),
            "temp_c": float(data["current"]["temp_c"]),
            "temp_f": float(data["current"]["temp_f"]),
            "updated_at": data["current"]["last_updated"],
            "uv": float(data["current"]["uv"]),
            "wind_dir": data["current"]["wind_dir"],
            "wind_kph": float(data["current"]["wind_kph"])
        },
        "location": {
            "country": data["location"]["country"],
            "lat": float(data["location"]["lat"]),
            "lon": float(data["location"]["lon"]),
            "name": data["location"]["name"],
            "timezone": data["location"]["tz_id"]
        }
    }
    
    forecast_mapped_list = []
    for day in data["forecast"]["forecastday"]:
        forecast_mapped_list.append({
            "condition": day["day"]["condition"]["text"],
            "condition_icon": "https:" + day["day"]["condition"]["icon"],
            "date": day["date"],
            "rain_probability": float(day["day"].get("daily_chance_of_rain", 0)),
            "temp_high_c": float(day["day"]["maxtemp_c"]),
            "temp_high_f": float(day["day"]["maxtemp_f"]),
            "temp_low_c": float(day["day"]["mintemp_c"]),
            "temp_low_f": float(day["day"]["mintemp_f"])
        })
        
    forecast_mapped = {
        "forecast": forecast_mapped_list,
        "location": {
            "country": data["location"]["country"],
            "name": data["location"]["name"]
        }
    }
    
    # Generate trend from hourly data of today
    trend_list = []
    hours = data["forecast"]["forecastday"][0]["hour"]
    # Take 6 hours starting from current hour or spaced out
    for i in range(0, 24, 4):
        hour_data = hours[i]
        time_part = hour_data["time"].split(" ")[1] # YYYY-MM-DD HH:MM -> HH:MM
        trend_list.append({
            "temp_c": float(hour_data["temp_c"]),
            "temp_f": float(hour_data["temp_f"]),
            "time": time_part
        })
        
    insights_text = (
        f"Temperatures in {data['location']['name']} will range from {data['forecast']['forecastday'][0]['day']['mintemp_c']}°C to {data['forecast']['forecastday'][0]['day']['maxtemp_c']}°C. "
        f"Expect {data['current']['condition']['text'].lower()} conditions."
    )
    
    insights_mapped = {
        "insights": insights_text,
        "trend": trend_list
    }
    
    return current_mapped, forecast_mapped, insights_mapped

def get_weather(db: Session, location_name: str):
    """Get weather data from cache or external API/mock."""
    if not location_name or not location_name.strip():
        raise HTTPException(status_code=400, detail="Location parameter is missing or invalid")
        
    # 1. Get or create location
    location = get_or_create_location(db, location_name)
    
    # 2. Check cache
    cache = db.query(WeatherCache).filter(WeatherCache.location_id == location.id).first()
    now = datetime.now(timezone.utc)
    
    # Cache is valid for 15 minutes
    cache_valid = cache and (now - cache.cached_at.replace(tzinfo=timezone.utc) < timedelta(minutes=15))
    
    if cache_valid:
        return cache.weather_data, cache.forecast_data, cache.insights_data
        
    # 3. Fetch fresh data
    try:
        if WEATHER_API_KEY:
            current_data, forecast_data, insights_data = fetch_external_weather(location.name)
        else:
            current_data, forecast_data, insights_data = generate_mock_weather(location.name, location.country or "US")
    except HTTPException as he:
        # If external API fails but we have stale cache, return it as fallback
        if cache:
            logger.warning(f"External API failed, returning stale cache for {location.name}")
            return cache.weather_data, cache.forecast_data, cache.insights_data
        raise he
    except Exception as e:
        logger.error(f"Error fetching weather: {e}")
        if cache:
            return cache.weather_data, cache.forecast_data, cache.insights_data
        # Fallback to mock if external API fails completely
        current_data, forecast_data, insights_data = generate_mock_weather(location.name, location.country or "US")
        
    # 4. Update cache
    if not cache:
        cache = WeatherCache(
            location_id=location.id,
            weather_data=current_data,
            forecast_data=forecast_data,
            insights_data=insights_data,
            cached_at=now
        )
        db.add(cache)
    else:
        cache.weather_data = current_data
        cache.forecast_data = forecast_data
        cache.insights_data = insights_data
        cache.cached_at = now
        
    db.commit()
    return current_data, forecast_data, insights_data
