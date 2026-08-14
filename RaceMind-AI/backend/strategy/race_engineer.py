"""RaceEngineer: the single entry point the API and AI Engineer call.

Pulls together tyre wear, fuel, pit-window, undercut/overcut, traffic,
and weather into one `StrategyRecommendation`. Each sub-module stays
independently testable; this is just composition, no new modeling.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from database.models.enums import WeatherCondition
from strategy import overcut as overcut_mod
from strategy import pit_window as pit_window_mod
from strategy import traffic as traffic_mod
from strategy import undercut as undercut_mod
from strategy import weather as weather_mod
from strategy.fuel import FuelState
from strategy.tyre import TyreState


@dataclass
class RaceState:
    current_lap: int
    total_laps: int
    tyre_state: TyreState
    fuel_state: FuelState
    weather: WeatherCondition
    weather_forecast: list[WeatherCondition] = field(default_factory=list)

    # Undercut inputs: is there a car ahead we could jump with fresher tyres?
    gap_to_car_ahead_s: float | None = None
    assumed_laps_until_ahead_pits: int = 3
    fresh_tyre_advantage_s_per_lap: float = 0.5

    # Overcut inputs: is a car behind us pitting, and can we stay out and beat them?
    gap_to_car_behind_s: float | None = None
    car_behind_is_pitting: bool = False
    pace_deficit_s_per_lap: float = 0.3
    extra_laps_before_we_pit: int = 2

    pit_lane_time_loss_s: float = 22.0
    nearby_pit_exit_gaps_s: list[float] = field(default_factory=list)


@dataclass
class StrategyRecommendation:
    headline: str
    pit_window: pit_window_mod.PitWindow
    weather: weather_mod.WeatherRecommendation
    traffic: traffic_mod.TrafficAnalysis
    undercut: undercut_mod.UndercutAnalysis | None
    overcut: overcut_mod.OvercutAnalysis | None


class RaceEngineer:
    def evaluate(self, state: RaceState) -> StrategyRecommendation:
        window = pit_window_mod.calculate(
            current_lap=state.current_lap,
            total_laps=state.total_laps,
            tyre_state=state.tyre_state,
            fuel_state=state.fuel_state,
        )
        weather_rec = weather_mod.recommend(
            state.weather, state.tyre_state.compound, state.weather_forecast
        )
        traffic_rec = traffic_mod.analyze(state.nearby_pit_exit_gaps_s)

        undercut_rec = None
        if state.gap_to_car_ahead_s is not None:
            undercut_rec = undercut_mod.analyze(
                undercut_mod.UndercutInput(
                    gap_to_rival_s=state.gap_to_car_ahead_s,
                    fresh_tyre_advantage_s_per_lap=state.fresh_tyre_advantage_s_per_lap,
                    assumed_laps_until_rival_pits=state.assumed_laps_until_ahead_pits,
                )
            )

        overcut_rec = None
        if state.gap_to_car_behind_s is not None and state.car_behind_is_pitting:
            overcut_rec = overcut_mod.analyze(
                overcut_mod.OvercutInput(
                    gap_to_rival_s=state.gap_to_car_behind_s,
                    pit_lane_time_loss_s=state.pit_lane_time_loss_s,
                    pace_deficit_s_per_lap=state.pace_deficit_s_per_lap,
                    extra_laps_before_you_pit=state.extra_laps_before_we_pit,
                )
            )

        headline = self._headline(window, weather_rec, traffic_rec, undercut_rec, overcut_rec)

        return StrategyRecommendation(
            headline=headline,
            pit_window=window,
            weather=weather_rec,
            traffic=traffic_rec,
            undercut=undercut_rec,
            overcut=overcut_rec,
        )

    @staticmethod
    def _headline(
        window: pit_window_mod.PitWindow,
        weather_rec: weather_mod.WeatherRecommendation,
        traffic_rec: traffic_mod.TrafficAnalysis,
        undercut_rec: undercut_mod.UndercutAnalysis | None,
        overcut_rec: overcut_mod.OvercutAnalysis | None,
    ) -> str:
        if weather_rec.is_forecast_warning:
            return f"Weather change incoming - {weather_rec.reason}"
        if undercut_rec is not None and undercut_rec.is_viable:
            return f"Undercut live - box this lap, {undercut_rec.margin_s:+.1f}s margin"
        if overcut_rec is not None and overcut_rec.is_viable:
            return f"Stay out - overcut margin {overcut_rec.margin_s:+.1f}s once they pit"
        if not traffic_rec.is_clear_air:
            return f"Pit window open (lap {window.optimal_lap}) but exit is into traffic"
        return f"Pit window: laps {window.earliest_lap}-{window.latest_lap}, optimal {window.optimal_lap}"
