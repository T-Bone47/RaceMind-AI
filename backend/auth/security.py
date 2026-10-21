"""Password hashing and JWT helpers.

Password hashing uses `bcrypt` directly rather than passlib's bcrypt
backend - passlib's version-detection code has had repeated
compatibility breaks against bcrypt 4.x, and we don't need passlib's
multi-scheme abstraction for a single-algorithm choice.

bcrypt has a hard 72-byte input limit and silently truncates anything
longer, which would let two different passwords that share a 72-byte
prefix hash identically. `hash_password`/`verify_password` raise instead
of truncating silently; `UserCreate` also caps the field at 72
characters so the API rejects an over-long password before it ever
reaches here.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any, Literal

import bcrypt
import jwt

from config.settings import get_settings

_MAX_PASSWORD_BYTES = 72


class PasswordTooLongError(ValueError):
    pass


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > _MAX_PASSWORD_BYTES:
        raise PasswordTooLongError(f"Password must be at most {_MAX_PASSWORD_BYTES} bytes")
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    encoded = password.encode("utf-8")
    if len(encoded) > _MAX_PASSWORD_BYTES:
        return False
    return bcrypt.checkpw(encoded, hashed.encode("utf-8"))


TokenType = Literal["access", "refresh"]


def _create_token(subject: str, token_type: TokenType, expires_delta: timedelta) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> str:
    settings = get_settings()
    return _create_token(
        subject, "access", timedelta(minutes=settings.access_token_expire_minutes)
    )


def create_refresh_token(subject: str) -> str:
    settings = get_settings()
    return _create_token(subject, "refresh", timedelta(days=settings.refresh_token_expire_days))


def decode_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
