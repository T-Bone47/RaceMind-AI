from __future__ import annotations

from auth.security import hash_password
from database.models.user import User
from database.repositories.user_repository import UserRepository


async def test_create_and_get_by_email(db_session):
    repo = UserRepository(db_session)
    user = User(
        email="repo@example.com",
        hashed_password=hash_password("password123"),
        display_name="Repo Test",
    )
    created = await repo.create(user)
    assert created.id is not None
    assert created.created_at is not None

    fetched = await repo.get_by_email("repo@example.com")
    assert fetched is not None
    assert fetched.id == created.id


async def test_get_by_email_missing_returns_none(db_session):
    repo = UserRepository(db_session)
    result = await repo.get_by_email("doesnotexist@example.com")
    assert result is None
