"""Pit window: the lap range in which stopping makes sense, combining
the tyre-cliff and fuel projections into one number the driver can act on.
"""

from __future__ import annotations

from dataclasses import dataclass

from strategy.fuel import FuelState
from strategy.fuel import project as project_fuel
from strategy.tyre import TyreState, predict_cliff


@dataclass(frozen=True)
class PitWindow:
    earliest_lap: int
    optimal_lap: int
    latest_lap: int
    reason: str


def calculate(
    *,
    current_lap: int,
    total_laps: int,
    tyre_state: TyreState,
    fuel_state: FuelState,
    cliff_wear_pct: float = 75.0,
) -> PitWindow:
    cliff = predict_cliff(tyre_state, cliff_wear_pct)
    fuel_proj = project_fuel(fuel_state, laps_to_finish=total_laps - current_lap)

    tyre_latest = current_lap + cliff.laps_to_cliff
    fuel_latest = current_lap + int(fuel_proj.laps_remaining)

    latest_lap = min(tyre_latest, fuel_latest, total_laps)
    optimal_lap = max(latest_lap - 1, current_lap)  # pit just ahead of the constraint, not exactly on it
    earliest_lap = max(current_lap + 1, optimal_lap - 3)

    if fuel_proj.is_critical and fuel_latest <= tyre_latest:
        reason = f"Fuel-limited: {fuel_proj.laps_remaining:.1f} laps of fuel remain"
    else:
        reason = (
            f"Tyre-limited: {tyre_state.compound.value} cliff projected in "
            f"{cliff.laps_to_cliff} laps (confidence {cliff.confidence:.0%})"
        )

    return PitWindow(
        earliest_lap=min(earliest_lap, total_laps),
        optimal_lap=min(optimal_lap, total_laps),
        latest_lap=min(latest_lap, total_laps),
        reason=reason,
    )
