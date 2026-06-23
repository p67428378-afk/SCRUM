import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./jewellery_inventory.db"
    TESTING: bool = False

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

# Override for testing if TESTING env var is set
if os.getenv("TESTING") == "true" or os.getenv("TESTING") == "True":
    settings.TESTING = True
    settings.DATABASE_URL = "sqlite:///:memory:"
