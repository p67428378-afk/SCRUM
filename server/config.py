import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ShopperHub Product Search API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

    # CORS Settings
    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )

    # Elasticsearch / Vector search config
    ELASTICSEARCH_URL: str = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    ELASTICSEARCH_INDEX: str = os.getenv("ELASTICSEARCH_INDEX", "products")
    USE_ELASTICSEARCH: bool = os.getenv("USE_ELASTICSEARCH", "false").lower() in (
        "true",
        "1",
        "t",
    )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
