"""
Module: config
Purpose: Configuration settings for the Weather Application.
Author: Backend Developer Agent
Created: 2026-06-19
"""

import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./weather.db")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
WEATHER_API_URL = os.getenv("WEATHER_API_URL", "https://api.weatherapi.com/v1")
TESTING = os.getenv("TESTING", "false").lower() == "true"
