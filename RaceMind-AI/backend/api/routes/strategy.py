from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from api.dependencies import get_session_service, get_strategy_service
from api.schemas.strategy import StrategyPlanRead, StrategyRecomputeRequest
from auth.dependencies import get_current_user
from database.models.strategy import StrategyPlan
from database.models.user import User
from services.session_service import SessionService
from services.strategy_service import StrategyService

router = APIRouter(prefix="/strategy", tags=["Strategy"])


@router.post("/{session_id}/recompute", response_model=StrategyPlanRead)
async def recompute_strategy(
    session_id: uuid.UUID,
    payload: StrategyRecomputeRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> StrategyPlan:
    await session_service.get_owned(session_id, current_user.id)
    return await strategy_service.recompute(session_id, payload.current_lap)


@router.get("/{session_id}/active", response_model=StrategyPlanRead)
async def get_active_strategy(
    session_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    strategy_service: Annotated[StrategyService, Depends(get_strategy_service)],
) -> StrategyPlan:
    await session_service.get_owned(session_id, current_user.id)
    plan = await strategy_service.get_active(session_id)
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No strategy computed for this session yet"
        )
    return plan
