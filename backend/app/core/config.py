"""Typed application configuration loaded from the environment."""

from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "test", "staging", "production"]


class Settings(BaseSettings):
    """Runtime configuration with safe defaults for local development."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        enable_decoding=False,
        extra="ignore",
    )

    APP_NAME: str = "DevPilot AI API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Environment = Field(
        default="development",
        validation_alias=AliasChoices("ENVIRONMENT", "APP_ENV"),
    )
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        validation_alias=AliasChoices("CORS_ORIGINS", "ALLOWED_ORIGINS"),
    )

    DATABASE_URL: str | None = None

    REDIS_ENABLED: bool = False
    REDIS_URL: str | None = None

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_SECRET_KEY: str | None = Field(
        default=None,
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY"),
    )
    JWT_REFRESH_SECRET_KEY: str | None = None

    DEMO_MODE: bool = False
    DEMO_USER_EMAIL: str = "demo@devpilot.ai"
    DEMO_USER_PASSWORD: str | None = None

    @field_validator("ENVIRONMENT", mode="before")
    @classmethod
    def normalize_environment(cls, value: object) -> object:
        if isinstance(value, str) and value.lower() == "release":
            return "production"
        return value

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value: object) -> object:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production"}:
                return False
            if normalized in {"true", "1", "yes", "on"}:
                return True
            if normalized in {"false", "0", "no", "off"}:
                return False
        return value

    @field_validator("CORS_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_comma_separated_values(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("DATABASE_URL")
    @classmethod
    def require_asyncpg_url(cls, value: str | None) -> str | None:
        if value and not value.startswith("postgresql+asyncpg://"):
            message = "DATABASE_URL must use the postgresql+asyncpg:// driver."
            raise ValueError(message)
        return value

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
