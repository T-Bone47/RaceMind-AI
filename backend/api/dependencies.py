"""Dependency-injection chain for the API layer.

Plain FastAPI `Depends` chaining rather than a separate DI framework -
it's idiomatic for this ecosystem, keeps every dependency's wiring
visible at its call site, and doesn't add a dependency just to satisfy
"has DI" as a checkbox.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ai.llm import LLMClient
from ai.voice_assistant import VoiceAssistant
from database.repositories.circuit_setup_repository import CircuitSetupRepository
from database.repositories.driver_profile_repository import DriverProfileRepository
from database.repositories.lap_repository import LapRepository
from database.repositories.recording_repository import (
    FuelLogRepository,
    TelemetryFrameRepository,
    TyreStintRepository,
)
from database.repositories.session_repository import SessionRepository
from database.repositories.strategy_repository import StrategyRepository
from database.repositories.user_repository import UserRepository
from database.session import get_db
from services.auth_service import AuthService
from services.coaching_service import CoachingService
from services.session_service import SessionService
from services.setup_service import SetupService
from services.strategy_service import StrategyService
from voice.service import VoiceService

DbSession = Annotated[AsyncSession, Depends(get_db)]


# --- Repositories ---


def get_user_repository(db: DbSession) -> UserRepository:
    return UserRepository(db)


def get_session_repository(db: DbSession) -> SessionRepository:
    return SessionRepository(db)


def get_lap_repository(db: DbSession) -> LapRepository:
    return LapRepository(db)


def get_tyre_repository(db: DbSession) -> TyreStintRepository:
    return TyreStintRepository(db)


def get_fuel_repository(db: DbSession) -> FuelLogRepository:
    return FuelLogRepository(db)


def get_telemetry_repository(db: DbSession) -> TelemetryFrameRepository:
    return TelemetryFrameRepository(db)


def get_strategy_repository(db: DbSession) -> StrategyRepository:
    return StrategyRepository(db)


def get_driver_profile_repository(db: DbSession) -> DriverProfileRepository:
    return DriverProfileRepository(db)


def get_setup_repository(db: DbSession) -> CircuitSetupRepository:
    return CircuitSetupRepository(db)


# --- Services ---


def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
) -> AuthService:
    return AuthService(user_repo)


def get_session_service(
    session_repo: Annotated[SessionRepository, Depends(get_session_repository)],
    lap_repo: Annotated[LapRepository, Depends(get_lap_repository)],
) -> SessionService:
    return SessionService(session_repo, lap_repo)


def get_strategy_service(
    strategy_repo: Annotated[StrategyRepository, Depends(get_strategy_repository)],
    tyre_repo: Annotated[TyreStintRepository, Depends(get_tyre_repository)],
    fuel_repo: Annotated[FuelLogRepository, Depends(get_fuel_repository)],
    session_repo: Annotated[SessionRepository, Depends(get_session_repository)],
) -> StrategyService:
    return StrategyService(strategy_repo, tyre_repo, fuel_repo, session_repo)


def get_setup_service(
    setup_repo: Annotated[CircuitSetupRepository, Depends(get_setup_repository)],
) -> SetupService:
    return SetupService(setup_repo)


def get_coaching_service(
    lap_repo: Annotated[LapRepository, Depends(get_lap_repository)],
    telemetry_repo: Annotated[TelemetryFrameRepository, Depends(get_telemetry_repository)],
    tyre_repo: Annotated[TyreStintRepository, Depends(get_tyre_repository)],
    session_repo: Annotated[SessionRepository, Depends(get_session_repository)],
) -> CoachingService:
    return CoachingService(lap_repo, telemetry_repo, tyre_repo, session_repo)


def get_llm_client() -> LLMClient:
    return LLMClient()


def get_voice_service() -> VoiceService:
    # No STT/TTS providers wired in yet - see backend/voice/base.py.
    return VoiceService()


def get_voice_assistant(
    voice_service: Annotated[VoiceService, Depends(get_voice_service)],
    llm_client: Annotated[LLMClient, Depends(get_llm_client)],
) -> VoiceAssistant:
    return VoiceAssistant(voice_service, llm_client)
