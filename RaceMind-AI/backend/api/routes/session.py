from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from api.dependencies import get_session_service
from api.schemas.session import SessionCreate, SessionRead
from auth.dependencies import get_current_user
from database.models.session import RaceSession
from database.models.user import User
from services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
) -> RaceSession:
    return await session_service.create_session(current_user.id, **payload.model_dump())


@router.get("", response_model=list[SessionRead])
async def list_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
) -> list[RaceSession]:
    return await session_service.list_for_user(current_user.id)


@router.get("/{session_id}", response_model=SessionRead)
async def get_session(
    session_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
) -> RaceSession:
    return await session_service.get_owned(session_id, current_user.id)
