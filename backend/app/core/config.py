from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "ARTHA AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-to-a-long-random-string-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql+asyncpg://opportunity:opportunity@localhost:5432/opportunityai"

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # xAI / Grok Voice (TTS). Required for Ara speech.
    XAI_API_KEY: str = ""


settings = Settings()
