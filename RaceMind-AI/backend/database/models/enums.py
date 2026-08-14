"""Domain enums persisted in the database.

`GameTitle` lives in `telemetry.models` instead of here, since the set of
supported sims is a telemetry-layer concern (and needs to be shared with
the non-DB parts of the app); everything below is purely data-shape.

Stored as VARCHAR + CHECK constraint (native_enum=False on the columns
that use these, see database/models/*.py) rather than native Postgres
ENUM types - adding a new member later is then a one-line constraint
migration instead of an `ALTER TYPE ... ADD VALUE`, which Postgres
can't run inside a transaction.
"""

from __future__ import annotations

from enum import Enum


class SessionType(str, Enum):
    PRACTICE = "practice"
    QUALIFYING = "qualifying"
    SPRINT_QUALIFYING = "sprint_qualifying"
    SPRINT = "sprint"
    RACE = "race"
    TIME_TRIAL = "time_trial"


class WeatherCondition(str, Enum):
    CLEAR = "clear"
    LIGHT_CLOUD = "light_cloud"
    OVERCAST = "overcast"
    LIGHT_RAIN = "light_rain"
    HEAVY_RAIN = "heavy_rain"
    STORM = "storm"


class TyreCompound(str, Enum):
    SOFT = "soft"
    MEDIUM = "medium"
    HARD = "hard"
    INTERMEDIATE = "intermediate"
    WET = "wet"


class SetupSource(str, Enum):
    """Where a CircuitSetup came from - the load-bearing field for
    supporting community imports and future setup databases without
    hardcoding any one external source. New sources register as a
    SetupImporter (see backend/setups/importers/); setups they produce
    carry this tag."""

    OFFICIAL_BASELINE = "official_baseline"  # RaceMind AI's own engineering-principle baselines
    COMMUNITY_IMPORT = "community_import"  # imported via a SetupImporter
    USER_CREATED = "user_created"  # a specific user's own saved setup
    AI_GENERATED = "ai_generated"  # produced by the AI Setup Engine for specific feedback


class SetupInputDevice(str, Enum):
    CONTROLLER = "controller"
    WHEEL = "wheel"


class SetupSkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ESPORTS = "esports"
    ALL_LEVELS = "all_levels"


class SetupWeather(str, Enum):
    DRY = "dry"
    WET = "wet"
