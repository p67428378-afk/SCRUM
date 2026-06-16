"""
Module: config
Purpose: Application configuration settings using pydantic-settings.
Author: Backend Developer Agent
Created: 2026-06-16
"""
import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Database
    DATABASE_URL: str = "sqlite:///./kyc.db"

    # External APIs
    UIDAI_API_URL: str = "https://api.uidai.gov.in"
    NSDL_API_URL: str = "https://api.nsdl.co.in"
    RBI_API_URL: str = "https://api.rbi.org.in"
    CIBIL_API_URL: str = "https://api.cibil.com"

    # CORS
    ALLOWED_ORIGINS: str = "*"


settings = Settings()
