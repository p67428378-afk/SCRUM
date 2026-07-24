from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    JWT_SECRET_KEY: str = "dev-secret-change-in-production-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    MFA_OTP_EXPIRE_MINUTES: int = 5
    MFA_RESEND_COOLDOWN_SECONDS: int = 60
    MFA_MAX_RESENDS: int = 5

    MAX_FAILED_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 30
    MAX_FLOW_RESTARTS: int = 3
    FLOW_RESTART_WINDOW_MINUTES: int = 15

    IP_THROTTLE_THRESHOLD: int = 20
    IP_THROTTLE_WINDOW_MINUTES: int = 10

    STEP_UP_THRESHOLD_AMOUNT: float = 5000.0

    DEV_MODE: bool = True
    DEV_MFA_BYPASS_CODE: str = "000000"

    class Config:
        env_file = ".env"


settings = Settings()
