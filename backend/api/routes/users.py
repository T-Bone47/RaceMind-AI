from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from api.dependencies import DbSession
from api.schemas.user import UserRead, UserUpdate
from auth.dependencies import get_current_user
from database.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.patch("/me", response_model=UserRead)
async def update_me(
    payload: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: DbSession,
) -> User:
    if payload.display_name is not None:
        current_user.display_name = payload.display_name
        db.add(current_user)
        await db.flush()
        await db.refresh(current_user)
    return current_user
