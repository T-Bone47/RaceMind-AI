"""Application configuration.

All runtime configuration flows through this module. Settings are loaded
from environment variables (and a local .env file in development) exactly
once per process via `get_settings()`, which is cached so every part of
the app - and every FastAPI dependency - shares the same instance.
"""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Literal
import re

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- App ---
    app_name: str = "RaceMind AI"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # --- Database ---
    # Async driver (asyncpg) for the running app. Alembic reuses this same
    # URL via an async engine - see backend/alembic/env.py.
    database_url: str = "postgresql+asyncpg://racemind:racemind@localhost:5432/racemind"

    # --- Auth ---
    secret_key: str = Field(default="dev-secret-change-me-in-production", min_length=8)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 14

    # --- CORS ---
    # Stored as a raw string so pydantic-settings never tries to
    # JSON-decode it (which breaks on comma-separated values in
    # pydantic-settings ≥ 2.7).  Use the `cors_origins` property
    # for the parsed list.
    cors_origins: str = "http://localhost:3000,http://localhost:5173,app://."

    # --- Logging ---
    log_level: str = "INFO"

    # --- Telemetry ---
    udp_default_host: str = "0.0.0.0"
    udp_default_port: int = 20777

    # --- AI Engineer (Gemini) ---
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    gemini_max_tokens: int = 300

    # --- Agent Authentication ---
    agent_secret: str = "dev-agent-secret-change-me"

    # --- Reference data (FastF1) ---
    fastf1_cache_dir: str = "./.fastf1_cache"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS into a list of origin strings.

        Accepts:
          - Comma-separated: ``http://a.com,http://b.com``
          - JSON array:      ``["http://a.com","http://b.com"]``
          - Empty string:    returns ``[]``
        """
        raw = self.cors_origins.strip()
        if not raw:
            return []
        if raw.startswith("["):
            return json.loads(raw)
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    from pydantic import model_validator
    @model_validator(mode="after")
    def normalize_database_url(self) -> Settings:
        """Railway (and most PaaS providers) inject DATABASE_URL as
        ``postgresql://…``.  SQLAlchemy's async engine requires the
        ``+asyncpg`` dialect suffix.  Rewrite transparently so deployment
        works without manual URL editing."""
        url = self.database_url
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            self.database_url = re.sub(r"^postgres(ql)?://", "postgresql+asyncpg://", url)
        return self

    @model_validator(mode="after")
    def validate_production_settings(self) -> Settings:
        if self.is_production:
            import logging
            logger = logging.getLogger("racemind.config")
            if self.debug:
                logger.warning("Debug mode is enabled in production. This is not recommended.")
            if self.secret_key == "dev-secret-change-me-in-production":
                logger.warning("Using default secret_key in production! A secure secret_key MUST be configured.")
            if self.agent_secret == "dev-agent-secret-change-me":
                logger.warning("Using default agent_secret in production! A secure agent_secret MUST be configured.")
            if "*" in self.cors_origins_list:
                logger.warning("Wildcard CORS origins (*) are enabled in production. This is not recommended.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
