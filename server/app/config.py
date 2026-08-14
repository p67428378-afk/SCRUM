import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Debit Card Spend Alert Microservice"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spend_alerts.db")
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"

    # Mock Card Management System (CMS) database
    # Maps 16-digit card number to registered mobile number
    MOCK_CMS_CARDS: dict[str, str] = {
        "1234567812344321": "+919876543210",
        "1111222233334444": "+919876543211",
        "5555666677778888": "+12345678901",
    }

    class Config:
        env_file = ".env"


settings = Settings()
