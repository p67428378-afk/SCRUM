import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Cafe Interior Designer Ideas Portal"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "dev-super-secret-key-change-in-production-1234567890"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cafe_interior.db")
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "cafe-interior-designs")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    PRESIGNED_URL_EXPIRE_SECONDS: int = 15 * 60  # 15 minutes

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
