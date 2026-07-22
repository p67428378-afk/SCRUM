from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    GCS_BUCKET_NAME: str = "securelog-audit-exports-bucket"
    # 32-byte base64-encoded key for AES-256 encryption.
    # We can generate a default one for development.
    # e.g., cryptography.hazmat.primitives.ciphers.aead.AESGCM.generate_key(bit_length=256)
    # Base64 encoded: '4edea34edea34edea34edea34edea34edea34edea34=' (just a placeholder)
    ENCRYPTION_KEY: str = "4edea34edea34edea34edea34edea34edea34edea34="
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    TESTING: bool = False

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
