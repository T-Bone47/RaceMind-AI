from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from api.dependencies import get_coaching_service, get_session_service
from api.schemas.coaching import CoachingReportRead
from auth.dependencies import get_current_user
from coaching.models import CoachingReport
from database.models.user import User
from services.coaching_service import CoachingService
from services.session_service import SessionService

router = APIRouter(prefix="/coaching", tags=["Coaching"])


@router.get("/{session_id}/report", response_model=CoachingReportRead)
async def get_coaching_report(
    session_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    coaching_service: Annotated[CoachingService, Depends(get_coaching_service)],
) -> CoachingReport:
    await session_service.get_owned(session_id, current_user.id)  # raises if missing/not yours
    return await coaching_service.generate_report(session_id)
