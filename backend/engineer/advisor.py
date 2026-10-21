"""EngineeringAdvisor: the single entry point that runs every advisor
against an EngineerSessionState and returns one prioritized list.

Mirrors strategy/race_engineer.py's composition pattern deliberately -
each advisor stays independently testable, this is just orchestration,
no new modeling. Unlike strategy.race_engineer.RaceEngineer (which
returns one StrategyRecommendation with fixed named fields), this
returns a flat, extensible list[Recommendation] - the right shape for
"structured recommendations with priority levels", since the number of
simultaneous concerns (tyre + fuel + a Safety Car + damage, all at once)
isn't fixed the way a single pit-strategy call is.
"""

from __future__ import annotations

from engineer import (
    damage_advisor,
    drs_advisor,
    ers_advisor,
    flag_advisor,
    fuel_advisor,
    overcut_advisor,
    pit_window_advisor,
    push_conserve_advisor,
    undercut_advisor,
)
from engineer import tyre_advisor as tyre_advisor_module
from engineer import weather_advisor as weather_advisor_module
from engineer.models import EngineerSessionState, Recommendation, priority_rank


class EngineeringAdvisor:
    def analyze(self, state: EngineerSessionState) -> list[Recommendation]:
        recommendations: list[Recommendation] = []

        recommendations += tyre_advisor_module.analyze(state.tyre_state)
        recommendations += fuel_advisor.analyze(
            state.fuel_state, laps_to_finish=state.total_laps - state.current_lap
        )
        recommendations += ers_advisor.analyze(state.ers_state)
        recommendations += drs_advisor.analyze(state.drs)
        recommendations += pit_window_advisor.analyze(
            current_lap=state.current_lap,
            total_laps=state.total_laps,
            tyre_state=state.tyre_state,
            fuel_state=state.fuel_state,
        )
        recommendations += weather_advisor_module.analyze(
            state.weather, state.tyre_state.compound, state.weather_forecast
        )
        recommendations += flag_advisor.analyze(
            state.track_status,
            laps_until_scheduled_pit=self._laps_until_scheduled_pit(state),
        )
        recommendations += damage_advisor.analyze(state.car_damage)
        recommendations += undercut_advisor.analyze(gap_to_car_ahead_s=state.gap_to_car_ahead_s)
        recommendations += overcut_advisor.analyze(gap_to_car_behind_s=state.gap_to_car_behind_s)
        recommendations += push_conserve_advisor.analyze(
            gap_to_car_ahead_s=state.gap_to_car_ahead_s,
            gap_to_car_behind_s=state.gap_to_car_behind_s,
        )

        return sorted(recommendations, key=lambda r: priority_rank(r.priority), reverse=True)

    @staticmethod
    def _laps_until_scheduled_pit(state: EngineerSessionState) -> int | None:
        from strategy.pit_window import calculate

        window = calculate(
            current_lap=state.current_lap,
            total_laps=state.total_laps,
            tyre_state=state.tyre_state,
            fuel_state=state.fuel_state,
        )
        return window.optimal_lap - state.current_lap
