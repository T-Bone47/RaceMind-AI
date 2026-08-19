"""Regression tests for config.settings.Settings.

These ensure the documented .env.example format and actual pydantic-settings
parsing behaviour agree, so a fresh installation works out-of-the-box.
"""

from __future__ import annotations

import pytest

from config.settings import Settings

# =====================================================================
# CORS_ORIGINS parsing
# =====================================================================


class TestCorsOriginsParsing:
    """The .env.example documents:

        CORS_ORIGINS=http://localhost:3000,http://localhost:5173

    Settings.cors_origins stores this as a raw string (avoiding
    pydantic-settings JSON-decode issues with list[str] env vars).
    Settings.cors_origins_list parses it into the list FastAPI needs.
    """

    def test_comma_separated_format(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Exact format from .env.example."""
        monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
        s = Settings()
        assert s.cors_origins_list == ["http://localhost:3000", "http://localhost:5173"]

    def test_comma_separated_with_spaces(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Trailing/leading whitespace around each origin is tolerated."""
        monkeypatch.setenv("CORS_ORIGINS", "  http://a.com , http://b.com  ")
        s = Settings()
        assert s.cors_origins_list == ["http://a.com", "http://b.com"]

    def test_json_array_format(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """pydantic-settings also accepts a JSON-encoded list."""
        monkeypatch.setenv("CORS_ORIGINS", '["http://localhost:3000","http://localhost:5173"]')
        s = Settings()
        assert s.cors_origins_list == ["http://localhost:3000", "http://localhost:5173"]

    def test_single_origin(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """A single origin with no commas should still produce a list."""
        monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000")
        s = Settings()
        assert s.cors_origins_list == ["http://localhost:3000"]

    def test_default_when_unset(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """When CORS_ORIGINS is not set, the Settings default applies."""
        monkeypatch.delenv("CORS_ORIGINS", raising=False)
        s = Settings()
        assert "http://localhost:3000" in s.cors_origins_list
        assert "http://localhost:5173" in s.cors_origins_list

    def test_empty_string_gives_empty_list(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """An explicitly empty value should not produce phantom origins."""
        monkeypatch.setenv("CORS_ORIGINS", "")
        s = Settings()
        assert s.cors_origins_list == []


# =====================================================================
# General settings sanity checks
# =====================================================================


class TestSettingsDefaults:
    """Quick smoke tests that critical defaults are present."""

    def test_default_environment(self) -> None:
        s = Settings()
        assert s.environment in {"development", "staging", "production", "test"}

    def test_api_prefix(self) -> None:
        s = Settings()
        assert s.api_v1_prefix.startswith("/")

    def test_is_production_property(self) -> None:
        s = Settings(
            environment="production",
            secret_key="valid-prod-secret-key-that-is-long-enough",
            agent_secret="valid-prod-agent-secret",
            debug=False
        )
        assert s.is_production is True

        s2 = Settings(environment="development")
        assert s2.is_production is False
