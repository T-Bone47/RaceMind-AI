from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from database.models.enums import WeatherCondition
from database.models.strategy import StrategyPlan
from database.repositories.recording_repository import FuelLogRepository, TyreStintRepository
from database.repositories.session_repository import SessionRepository
from database.repositories.strategy_repository import StrategyRepository
from strategy.fuel import FuelState
from strategy.race_engineer import RaceEngineer, RaceState
from strategy.tyre import TyreState


class StrategyService:
    def __init__(
        self,
        strategy_repo: StrategyRepository,
        tyre_repo: TyreStintRepository,
        fuel_repo: FuelLogRepository,
        session_repo: SessionRepository,
    ) -> None:
        self.strategy_repo = strategy_repo
        self.tyre_repo = tyre_repo
        self.fuel_repo = fuel_repo
        self.session_repo = session_repo
        self.engine = RaceEngineer()

    async def recompute(self, session_id: uuid.UUID, current_lap: int) -> StrategyPlan:
        session = await self.session_repo.get(session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        latest_tyre = await self.tyre_repo.latest_for_session(session_id)
        latest_fuel = await self.fuel_repo.latest_for_session(session_id)
        if latest_tyre is None or latest_fuel is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No tyre/fuel telemetry recorded for this session yet",
            )

        race_state = RaceState(
            current_lap=current_lap,
            total_laps=session.total_laps or current_lap + 10,
            tyre_state=TyreState(
                compound=latest_tyre.compound,
                age_laps=latest_tyre.age_laps,
                wear_pct=latest_tyre.average_wear_pct,
            ),
            fuel_state=FuelState(
                remaining_kg=latest_fuel.fuel_remaining_kg,
                consumption_per_lap_kg=latest_fuel.fuel_per_lap_kg or 0.0,
            ),
            weather=session.weather or WeatherCondition.CLEAR,
        )
        recommendation = self.engine.evaluate(race_state)

        await self.strategy_repo.deactivate_all_for_session(session_id)
        plan = StrategyPlan(
            session_id=session_id,
            recommended_pit_lap=recommendation.pit_window.optimal_lap,
            recommended_compound=recommendation.weather.recommended_compound,
            reason=recommendation.headline,
            is_active=True,
        )
        return await self.strategy_repo.create(plan)

    async def get_active(self, session_id: uuid.UUID) -> StrategyPlan | None:
        return await self.strategy_repo.get_active_for_session(session_id)
