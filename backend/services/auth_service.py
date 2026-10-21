from __future__ import annotations

from fastapi import HTTPException, status

from auth.security import create_access_token, create_refresh_token, hash_password, verify_password
from database.models.user import User
from database.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def register(self, email: str, password: str, display_name: str) -> dict[str, str]:
        existing = await self.user_repo.get_by_email(email)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
            )
        user = User(
            email=email,
            hashed_password=hash_password(password),
            display_name=display_name,
        )
        user = await self.user_repo.create(user)
        return self._issue_tokens(user)

    async def authenticate(self, email: str, password: str) -> dict[str, str]:
        user = await self.user_repo.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated"
            )
        return self._issue_tokens(user)

    def refresh(self, user: User) -> dict[str, str]:
        return self._issue_tokens(user)

    @staticmethod
    def _issue_tokens(user: User) -> dict[str, str]:
        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        }
