import os


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforstudentdashboard109")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:////tmp/student_dashboard.db")


settings = Settings()
