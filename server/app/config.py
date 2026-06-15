import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./tasks.db"
    TESTING: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
if os.getenv("TESTING") == "true" or os.getenv("TESTING") == "True":
    settings.TESTING = True
    settings.DATABASE_URL = "sqlite:///:memory:"
