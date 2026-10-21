from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from database.models.session import RaceSession
from database.repositories.lap_repository import LapRepository
from database.repositories.session_repository import SessionRepository


class SessionService:
    def __init__(self, session_repo: SessionRepository, lap_repo: LapRepository) -> None:
        self.session_repo = session_repo
        self.lap_repo = lap_repo

    async def create_session(self, user_id: uuid.UUID, **fields: object) -> RaceSession:
        session = RaceSession(user_id=user_id, **fields)
        return await self.session_repo.create(session)

    async def list_for_user(self, user_id: uuid.UUID) -> list[RaceSession]:
        return await self.session_repo.list_for_user(user_id)

    async def get_owned(self, session_id: uuid.UUID, user_id: uuid.UUID) -> RaceSession:
        session = await self.session_repo.get(session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        if session.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your session")
        return session
