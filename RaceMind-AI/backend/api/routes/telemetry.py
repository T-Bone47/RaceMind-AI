from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from api.dependencies import (
    get_fuel_repository,
    get_lap_repository,
    get_session_service,
    get_telemetry_repository,
    get_tyre_repository,
)
from api.schemas.lap import LapCreate, LapRead
from api.schemas.recording import (
    FuelLogCreate,
    FuelLogRead,
    TelemetryFrameRead,
    TyreStintCreate,
    TyreStintRead,
)
from auth.dependencies import get_current_user
from database.models.fuel import FuelLog
from database.models.lap import Lap
from database.models.telemetry import TelemetryFrameRecord
from database.models.tyre import TyreStint
from database.models.user import User
from database.repositories.lap_repository import LapRepository
from database.repositories.recording_repository import (
    FuelLogRepository,
    TelemetryFrameRepository,
    TyreStintRepository,
)
from services.session_service import SessionService

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.post("/{session_id}/laps", response_model=LapRead, status_code=status.HTTP_201_CREATED)
async def record_lap(
    session_id: uuid.UUID,
    payload: LapCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    lap_repo: Annotated[LapRepository, Depends(get_lap_repository)],
) -> Lap:
    await session_service.get_owned(session_id, current_user.id)  # raises if not owned
    lap = Lap(session_id=session_id, **payload.model_dump())
    return await lap_repo.create(lap)


@router.get("/{session_id}/laps", response_model=list[LapRead])
async def list_laps(
    session_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    lap_repo: Annotated[LapRepository, Depends(get_lap_repository)],
) -> list[Lap]:
    await session_service.get_owned(session_id, current_user.id)
    return await lap_repo.list_for_session(session_id)


@router.post("/{session_id}/tyres", response_model=TyreStintRead, status_code=status.HTTP_201_CREATED)
async def record_tyre_stint(
    session_id: uuid.UUID,
    payload: TyreStintCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    tyre_repo: Annotated[TyreStintRepository, Depends(get_tyre_repository)],
) -> TyreStint:
    await session_service.get_owned(session_id, current_user.id)
    stint = TyreStint(session_id=session_id, **payload.model_dump())
    return await tyre_repo.create(stint)


@router.post("/{session_id}/fuel", response_model=FuelLogRead, status_code=status.HTTP_201_CREATED)
async def record_fuel_log(
    session_id: uuid.UUID,
    payload: FuelLogCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    fuel_repo: Annotated[FuelLogRepository, Depends(get_fuel_repository)],
) -> FuelLog:
    await session_service.get_owned(session_id, current_user.id)
    log = FuelLog(session_id=session_id, **payload.model_dump())
    return await fuel_repo.create(log)


@router.get("/{session_id}/frames", response_model=list[TelemetryFrameRead])
async def list_frames(
    session_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session_service: Annotated[SessionService, Depends(get_session_service)],
    telemetry_repo: Annotated[TelemetryFrameRepository, Depends(get_telemetry_repository)],
    limit: int = 1000,
    offset: int = 0,
) -> list[TelemetryFrameRecord]:
    await session_service.get_owned(session_id, current_user.id)
    return await telemetry_repo.list_for_session(session_id, limit=limit, offset=offset)
