import os


class Settings:
    PROJECT_NAME: str = "DG Cluster Assortment Advisor"
    API_V1_STR: str = "/api/v1"

    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"


settings = Settings()
