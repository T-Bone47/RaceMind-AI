from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from api.dependencies import get_setup_service
from api.schemas.circuit_setup import (
    CircuitSetupCreate,
    CircuitSetupRead,
    SetupRecommendationRead,
    SetupRecommendationRequest,
)
from auth.dependencies import get_current_user
from database.models.circuit_setup import CircuitSetup
from database.models.user import User
from services.setup_service import SetupService

router = APIRouter(prefix="/setups", tags=["Setups"])


@router.post("/recommend", response_model=SetupRecommendationRead)
async def recommend_setup(
    payload: SetupRecommendationRequest,
    _current_user: Annotated[User, Depends(get_current_user)],
    setup_service: Annotated[SetupService, Depends(get_setup_service)],
) -> SetupRecommendationRead:
    recommendation = await setup_service.recommend(**payload.model_dump())
    return SetupRecommendationRead(
        setup=CircuitSetupRead.model_validate(recommendation.setup, from_attributes=True),
        is_exact_match=recommendation.is_exact_match,
        fallback_reason=recommendation.fallback_reason,
    )


@router.get("", response_model=list[CircuitSetupRead])
async def list_setups_for_track(
    _current_user: Annotated[User, Depends(get_current_user)],
    setup_service: Annotated[SetupService, Depends(get_setup_service)],
    game: str | None = None,
    track_name: str | None = None,
) -> list[CircuitSetup]:
    if game and track_name:
        return await setup_service.list_for_track(game, track_name)  # type: ignore[arg-type]
    return await setup_service.list_all()


@router.post("", response_model=CircuitSetupRead, status_code=status.HTTP_201_CREATED)
async def create_setup(
    payload: CircuitSetupCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    setup_service: Annotated[SetupService, Depends(get_setup_service)],
) -> CircuitSetup:
    return await setup_service.create_user_setup(current_user.id, **payload.model_dump())


@router.delete("/{setup_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setup(
    setup_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    setup_service: Annotated[SetupService, Depends(get_setup_service)],
) -> None:
    await setup_service.delete_owned(setup_id, current_user.id)
