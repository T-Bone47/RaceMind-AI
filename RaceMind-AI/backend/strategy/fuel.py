"""Fuel-load heuristics: consumption rate and laps-remaining projection."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FuelState:
    remaining_kg: float
    consumption_per_lap_kg: float


@dataclass(frozen=True)
class FuelProjection:
    laps_remaining: float
    is_critical: bool  # true if fuel would run out before the target lap


def laps_remaining(state: FuelState) -> float:
    if state.consumption_per_lap_kg <= 0:
        return float("inf")
    return state.remaining_kg / state.consumption_per_lap_kg


def project(state: FuelState, laps_to_finish: int, safety_margin_laps: float = 1.0) -> FuelProjection:
    remaining = laps_remaining(state)
    return FuelProjection(
        laps_remaining=round(remaining, 2),
        is_critical=remaining < (laps_to_finish + safety_margin_laps),
    )
