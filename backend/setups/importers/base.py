"""The extension point for "importing community setups and future setup
databases" without hardcoding any one external source into RaceMind AI.

Mirrors telemetry/provider.py's shape deliberately: a Protocol every
importer satisfies, a normalized DTO so importers don't need direct ORM
access, and a registry callers use instead of hardcoding which importer
runs. Adding a new source means writing one class that implements
`SetupImporter` and registering it - nothing else in the setup engine
changes.

No importer is registered by default - this file defines the
architecture, not a live scraper. See backend/setups/seed_data.py for
RaceMind AI's own baseline setups, which go through this same interface
(SeedDataImporter) rather than being a special case.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from database.models.enums import SessionType, SetupInputDevice, SetupSkillLevel, SetupWeather
from telemetry.models import GameTitle


@dataclass(frozen=True)
class SetupImportRecord:
    """Normalized shape every importer produces - mirrors CircuitSetup's
    physical fields but stays a plain dataclass so importers don't need
    a database session or ORM knowledge."""

    game: GameTitle
    track_name: str
    session_type: SessionType
    weather: SetupWeather
    input_device: SetupInputDevice
    skill_level: SetupSkillLevel
    name: str

    front_wing: int
    rear_wing: int
    diff_on_throttle: int
    diff_off_throttle: int
    front_camber: float
    rear_camber: float
    front_toe: float
    rear_toe: float
    front_suspension: int
    rear_suspension: int
    front_anti_roll_bar: int
    rear_anti_roll_bar: int
    front_ride_height: int
    rear_ride_height: int
    brake_pressure: int
    brake_bias: int
    tyre_pressure_fl: float
    tyre_pressure_fr: float
    tyre_pressure_rl: float
    tyre_pressure_rr: float
    engine_braking: int | None = None
    ballast: int | None = None
    fuel_load: float | None = None
    notes: str | None = None
    track_guide_video_url: str | None = None
    race_strategy_notes: str | None = None
    source_attribution: str | None = None


class SetupImporter(Protocol):
    """One implementation per external source. `source_name` becomes
    part of `CircuitSetup.source_attribution` so an imported setup is
    always traceable back to where it came from."""

    source_name: str

    async def fetch(self, game: GameTitle, track_name: str) -> list[SetupImportRecord]:
        """Returns whatever setups this source has for the given
        game/track - an empty list if it has none, never a fabricated
        placeholder."""
        ...


class ImporterRegistry:
    def __init__(self) -> None:
        self._importers: dict[str, SetupImporter] = {}

    def register(self, importer: SetupImporter) -> None:
        self._importers[importer.source_name] = importer

    def get(self, source_name: str) -> SetupImporter | None:
        return self._importers.get(source_name)

    def all(self) -> list[SetupImporter]:
        return list(self._importers.values())


registry = ImporterRegistry()
