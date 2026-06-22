"""
Module: config
Purpose: Application configuration settings
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./society.db"
    TESTING: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
