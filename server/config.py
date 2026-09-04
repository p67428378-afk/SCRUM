import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/books_app.db")
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
