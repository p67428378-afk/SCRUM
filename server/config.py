import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Library Management System"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./library.db")
    SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
