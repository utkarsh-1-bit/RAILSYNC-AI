"""
RAILOPT AI — Application Configuration
Settings management via pydantic-settings with .env support.
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "RAILSYNC AI"
    APP_VERSION: str = "1.0.0"
    LOG_LEVEL: str = "INFO"
    DEMO_MODE: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./railopt.db"

    # Authentication
    JWT_SECRET: str = "railopt-sih2026-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Weather API (optional)
    OPENWEATHER_API_KEY: Optional[str] = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def is_postgres(self) -> bool:
        return self.DATABASE_URL.startswith("postgresql")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
