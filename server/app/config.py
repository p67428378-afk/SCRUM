from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./trekguide.db"
    SECRET_KEY: str = "supersecretkeyfor trekkingguideapp"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    TESTING: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
