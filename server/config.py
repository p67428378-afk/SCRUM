import os


class Settings:
    PROJECT_NAME: str = "DG Cluster Assortment Advisor"
    API_V1_STR: str = "/api/v1"

    # Database configuration
    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"

    @property
    def DATABASE_URL(self) -> str:
        if self.TESTING:
            return "sqlite:///:memory:"
        return os.getenv("DATABASE_URL", "sqlite:///./assortment.db")


settings = Settings()
