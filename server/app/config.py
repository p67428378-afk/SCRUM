"""
Module: server.app.config
Purpose: Configuration settings for the FastAPI application.
Author: Backend Developer Agent
Created: 2026-06-24
"""

import os
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    SECRET_KEY: str = ""

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def get_secret_key(cls, v):
        if not v:
            # If we are in testing, development, or sandbox environment, provide a dummy key
            if (
                os.getenv("TESTING") == "true"
                or os.getenv("TESTING") == "1"
                or os.getenv("ENV") == "development"
                or os.getenv("ENV") is None
            ):
                return "test-secret-key-for-testing-only-1234567890"
            raise ValueError("SECRET_KEY must be set in production environment")
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
