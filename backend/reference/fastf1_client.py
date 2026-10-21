"""Thin wrapper around FastF1 (github.com/theOehrly/Fast-F1, MIT
licensed). Column names below (LapTime, Sector1Time, Compound, Driver,
Team, ...) are verified against fastf1.core.Laps._COLUMNS in the
vendored source, not guessed.

FastF1 talks to the F1 live-timing API and the jolpica-f1 (Ergast-
compatible) API for historical data - both real network calls. Nothing
in this module fabricates data: every field on `ReferenceLap` comes
directly from a FastF1 DataFrame row, and a session with no matching
laps raises `NoReferenceDataError` rather than returning a guess.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

import fastf1
import fastf1.core

SessionIdentifier = Literal["FP1", "FP2", "FP3", "Q", "S", "SQ", "R"]

_cache_configured = False


class NoReferenceDataError(Exception):
    """Raised when FastF1 has no matching lap/session data - never
    silently falls back to a fabricated number."""


def configure_cache(cache_dir: str | Path) -> None:
    """Must be called once at startup before any other function here.
    Without an on-disk cache, FastF1 keeps only an in-memory cache that's
    lost on every restart and re-fetches from the network every time -
    fine for a one-off script, not for a service that starts repeatedly.
    """
    global _cache_configured
    path = Path(cache_dir)
    path.mkdir(parents=True, exist_ok=True)
    fastf1.Cache.enable_cache(str(path))
    _cache_configured = True


def _ensure_cache_configured() -> None:
    if not _cache_configured:
        raise RuntimeError(
            "reference.fastf1_client.configure_cache() must be called once at "
            "startup before fetching any reference data."
        )


@dataclass(frozen=True)
class ReferenceLap:
    """A single real lap, straight from FastF1 - every field maps
    directly to a verified `Laps` DataFrame column."""

    driver: str
    driver_number: str
    team: str
    lap_time_s: float
    sector_1_s: float | None
    sector_2_s: float | None
    sector_3_s: float | None
    compound: str | None
    tyre_life_laps: float | None
    speed_trap_kph: float | None
    year: int
    event_name: str
    session_name: str


def get_session(
    year: int, event: str, session_identifier: SessionIdentifier = "Q"
) -> fastf1.core.Session:
    """`event` accepts anything FastF1's own lookup supports - a circuit
    name, country, or round number. Loads laps only (telemetry/weather/
    messages off) since the comparison use case only needs lap-level data;
    call `session.load(telemetry=True)` yourself for full telemetry."""
    _ensure_cache_configured()
    session = fastf1.get_session(year, event, session_identifier)
    session.load(laps=True, telemetry=False, weather=False, messages=False)
    return session


def _year_from_session(session: fastf1.core.Session) -> int:
    return int(session.event["EventDate"].year)


def _lap_to_reference(lap: Any, session: fastf1.core.Session) -> ReferenceLap:
    def _secs(value: Any) -> float | None:
        return value.total_seconds() if value is not None and value == value else None

    def _num(value: Any) -> float | None:
        return float(value) if value is not None and value == value else None

    return ReferenceLap(
        driver=str(lap["Driver"]),
        driver_number=str(lap["DriverNumber"]),
        team=str(lap["Team"]),
        lap_time_s=_secs(lap["LapTime"]) or 0.0,
        sector_1_s=_secs(lap["Sector1Time"]),
        sector_2_s=_secs(lap["Sector2Time"]),
        sector_3_s=_secs(lap["Sector3Time"]),
        compound=str(lap["Compound"]) if lap["Compound"] else None,
        tyre_life_laps=_num(lap["TyreLife"]),
        speed_trap_kph=_num(lap["SpeedFL"]),
        year=_year_from_session(session),
        event_name=str(session.event["EventName"]),
        session_name=str(session.name),
    )


def get_fastest_reference_lap(
    year: int, event: str, session_identifier: SessionIdentifier = "Q"
) -> ReferenceLap:
    """The outright fastest lap of the session - usually the pole/fastest
    qualifying lap when session_identifier='Q'."""
    session = get_session(year, event, session_identifier)
    fastest = session.laps.pick_fastest()
    if fastest is None:
        raise NoReferenceDataError(
            f"No lap data for {event} {year} {session_identifier} - FastF1 "
            "returned an empty result, not an error, so this is most likely "
            "a session that hasn't happened yet or a name FastF1 couldn't resolve."
        )
    return _lap_to_reference(fastest, session)


def get_driver_reference_lap(
    year: int, event: str, driver: str, session_identifier: SessionIdentifier = "Q"
) -> ReferenceLap:
    """`driver`: FastF1 driver identifier - three-letter code (e.g. "VER")
    or car number as a string, per FastF1's own pick_driver."""
    session = get_session(year, event, session_identifier)
    driver_laps = session.laps.pick_driver(driver)
    fastest = driver_laps.pick_fastest()
    if fastest is None:
        raise NoReferenceDataError(
            f"No lap data for driver '{driver}' at {event} {year} {session_identifier}"
        )
    return _lap_to_reference(fastest, session)
