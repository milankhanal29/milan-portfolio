"""Application configuration using Pydantic Settings."""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore", # Change from forbid to ignore to be safer
    )

    # Application
    APP_NAME: str = "Milan Khanal Portfolio API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/portfolio_db"
    DATABASE_URL_DIRECT: str = "postgresql://postgres:postgres@localhost:5432/portfolio_db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            return v
        # Railway provides postgres://, but asyncpg needs postgresql+asyncpg://
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://") and "+asyncpg" not in v:
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 300  # 5 minutes default

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def validate_redis_url(cls, v: str) -> str:
        if not v:
            return "redis://localhost:6379/0"
        # Ensure it starts with redis:// or rediss:// (SSL)
        if not v.startswith("redis://") and not v.startswith("rediss://"):
            return f"redis://{v}"
        return v

    # JWT
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Admin
    ADMIN_EMAIL: str = "admin@khanalmilan.com.np"
    ADMIN_PASSWORD: str = "changeme123"

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "https://khanalmilan.com.np",
        "https://birthday.khanalmilan.com.np",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if not v or v == "*":
            # If empty or *, fallback to defaults to avoid crashing with allow_credentials=True
            return [
                "http://localhost:3000",
                "https://khanalmilan.com.np",
                "https://birthday.khanalmilan.com.np",
            ]
        
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    return [v]
            if "," in v:
                return [i.strip() for i in v.split(",") if i.strip()]
            return [v.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000"]

    # Email
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@khanalmilan.com.np"
    EMAIL_FROM_NAME: str = "Milan Khanal"

    # Profile Extra
    MILAN_DOB: str = "2000-01-01"
    PORT: int = 8000

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    USE_CLOUDINARY: bool = False

    # Rate Limiting
    RATE_LIMIT_TIMES: int = 100
    RATE_LIMIT_SECONDS: int = 60

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"


settings = Settings()
