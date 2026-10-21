from __future__ import annotations

import uuid
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from auth.security import decode_token
from config.settings import get_settings
from database.models.user import User
from database.repositories.user_repository import UserRepository
from database.session import get_db

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Resolve the bearer token to a User.

    Goes through the same `get_db` dependency as every other route -
    this used to open its own session directly against the module-level
    engine, which quietly broke test isolation (dependency_overrides
    swaps `get_db`, not a hardcoded session factory two calls away).
    """
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise _CREDENTIALS_EXCEPTION
        subject = payload.get("sub")
        if subject is None:
            raise _CREDENTIALS_EXCEPTION
        user_id = uuid.UUID(subject)
    except (jwt.PyJWTError, ValueError) as exc:
        raise _CREDENTIALS_EXCEPTION from exc

    user = await UserRepository(db).get(user_id)
    if user is None or not user.is_active:
        raise _CREDENTIALS_EXCEPTION
    return user


async def get_current_active_superuser(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Superuser access required"
        )
    return current_user
