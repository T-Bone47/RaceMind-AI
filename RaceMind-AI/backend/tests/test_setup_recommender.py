from __future__ import annotations

import pytest

from database.models.circuit_setup import CircuitSetup
from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupSource,
    SetupWeather,
)
from database.repositories.circuit_setup_repository import CircuitSetupRepository
from setups.recommender import NoSetupAvailableError, SetupRecommender
from telemetry.models import GameTitle


def _setup(**overrides: object) -> CircuitSetup:
    defaults: dict[str, object] = dict(
        game=GameTitle.F1_25_2026_DLC,
        track_name="Monaco",
        session_type=SessionType.RACE,
        weather=SetupWeather.DRY,
        input_device=SetupInputDevice.WHEEL,
        skill_level=SetupSkillLevel.INTERMEDIATE,
        source=SetupSource.OFFICIAL_BASELINE,
        name="Test setup",
        front_wing=48,
        rear_wing=50,
        diff_on_throttle=60,
        diff_off_throttle=55,
        front_camber=-2.8,
        rear_camber=-1.6,
        front_toe=0.05,
        rear_toe=0.15,
        front_suspension=24,
        rear_suspension=22,
        front_anti_roll_bar=11,
        rear_anti_roll_bar=11,
        front_ride_height=6,
        rear_ride_height=8,
        brake_pressure=95,
        brake_bias=58,
        engine_braking=60,
        tyre_pressure_fl=23.0,
        tyre_pressure_fr=23.0,
        tyre_pressure_rl=21.5,
        tyre_pressure_rr=21.5,
    )
    defaults.update(overrides)
    return CircuitSetup(**defaults)


async def test_exact_match_is_preferred(db_session):
    repo = CircuitSetupRepository(db_session)
    await repo.create(_setup(skill_level=SetupSkillLevel.BEGINNER))
    await repo.create(_setup(skill_level=SetupSkillLevel.INTERMEDIATE))

    recommender = SetupRecommender(repo)
    result = await recommender.recommend(
        game=GameTitle.F1_25_2026_DLC,
        track_name="Monaco",
        session_type=SessionType.RACE,
        weather=SetupWeather.DRY,
        input_device=SetupInputDevice.WHEEL,
        skill_level=SetupSkillLevel.INTERMEDIATE,
    )

    assert result.is_exact_match
    assert result.fallback_reason is None
    assert result.setup.skill_level == SetupSkillLevel.INTERMEDIATE


async def test_falls_back_to_another_skill_level_when_no_exact_match(db_session):
    repo = CircuitSetupRepository(db_session)
    await repo.create(_setup(skill_level=SetupSkillLevel.ADVANCED))

    recommender = SetupRecommender(repo)
    result = await recommender.recommend(
        game=GameTitle.F1_25_2026_DLC,
        track_name="Monaco",
        session_type=SessionType.RACE,
        weather=SetupWeather.DRY,
        input_device=SetupInputDevice.WHEEL,
        skill_level=SetupSkillLevel.ESPORTS,  # nothing seeded at this level
    )

    assert not result.is_exact_match
    assert result.fallback_reason is not None
    assert "esports" in result.fallback_reason
    assert result.setup.skill_level == SetupSkillLevel.ADVANCED


async def test_falls_back_to_other_input_device_when_skill_level_also_missing(db_session):
    repo = CircuitSetupRepository(db_session)
    # Only a controller setup exists, at a skill level that won't match either.
    await repo.create(
        _setup(input_device=SetupInputDevice.CONTROLLER, skill_level=SetupSkillLevel.INTERMEDIATE)
    )

    recommender = SetupRecommender(repo)
    result = await recommender.recommend(
        game=GameTitle.F1_25_2026_DLC,
        track_name="Monaco",
        session_type=SessionType.RACE,
        weather=SetupWeather.DRY,
        input_device=SetupInputDevice.WHEEL,
        skill_level=SetupSkillLevel.INTERMEDIATE,
    )

    assert not result.is_exact_match
    assert result.setup.input_device == SetupInputDevice.CONTROLLER


async def test_raises_when_absolutely_nothing_matches(db_session):
    repo = CircuitSetupRepository(db_session)
    recommender = SetupRecommender(repo)

    with pytest.raises(NoSetupAvailableError):
        await recommender.recommend(
            game=GameTitle.F1_25_2026_DLC,
            track_name="Nonexistent Circuit",
            session_type=SessionType.RACE,
            weather=SetupWeather.DRY,
            input_device=SetupInputDevice.WHEEL,
            skill_level=SetupSkillLevel.INTERMEDIATE,
        )
