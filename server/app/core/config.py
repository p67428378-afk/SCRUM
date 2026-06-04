
import os

class Settings:
    PROJECT_NAME: str = "Todo App"
    API_V1_STR: str = "/api/v1"
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

settings = Settings()
