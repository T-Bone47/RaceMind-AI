"""Finds the best available CircuitSetup for a request, falling back
gracefully (and *transparently* - the caller always knows whether they
got an exact match) rather than silently returning something close.
"""

from __future__ import annotations

from dataclasses import dataclass

from database.models.circuit_setup import CircuitSetup
from database.models.enums import SessionType, SetupInputDevice, SetupSkillLevel, SetupWeather
from database.repositories.circuit_setup_repository import CircuitSetupRepository
from telemetry.models import GameTitle


@dataclass(frozen=True)
class SetupRecommendation:
    setup: CircuitSetup
    is_exact_match: bool
    fallback_reason: str | None


class NoSetupAvailableError(Exception):
    pass


class SetupRecommender:
    def __init__(self, repository: CircuitSetupRepository) -> None:
        self.repository = repository

    async def recommend(
        self,
        *,
        game: GameTitle,
        track_name: str,
        session_type: SessionType,
        weather: SetupWeather,
        input_device: SetupInputDevice,
        skill_level: SetupSkillLevel,
    ) -> SetupRecommendation:
        exact = await self.repository.find_matches(
            game=game,
            track_name=track_name,
            session_type=session_type,
            weather=weather,
            input_device=input_device,
            skill_level=skill_level,
        )
        if exact:
            return SetupRecommendation(setup=exact[0], is_exact_match=True, fallback_reason=None)

        # Fallback 1: same everything except skill level - a setup tuned
        # for a different skill level is still far more useful than
        # nothing, and the driver can adjust from a real starting point.
        for candidate_level in _SKILL_FALLBACK_ORDER:
            if candidate_level == skill_level:
                continue
            matches = await self.repository.find_matches(
                game=game,
                track_name=track_name,
                session_type=session_type,
                weather=weather,
                input_device=input_device,
                skill_level=candidate_level,
            )
            if matches:
                return SetupRecommendation(
                    setup=matches[0],
                    is_exact_match=False,
                    fallback_reason=(
                        f"No setup tuned for {skill_level.value} skill level - "
                        f"showing the {candidate_level.value} version instead."
                    ),
                )

        # Fallback 2: same everything except input device.
        other_device = (
            SetupInputDevice.CONTROLLER
            if input_device == SetupInputDevice.WHEEL
            else SetupInputDevice.WHEEL
        )
        matches = await self.repository.find_matches(
            game=game,
            track_name=track_name,
            session_type=session_type,
            weather=weather,
            input_device=other_device,
            skill_level=skill_level,
        )
        if matches:
            return SetupRecommendation(
                setup=matches[0],
                is_exact_match=False,
                fallback_reason=(
                    f"No {input_device.value} setup available - showing the "
                    f"{other_device.value} version, which may need brake/steering "
                    f"sensitivity adjustments for your input device."
                ),
            )

        raise NoSetupAvailableError(
            f"No setup available for {track_name} ({game.value}, {session_type.value}, "
            f"{weather.value}) in any skill level or input device."
        )


_SKILL_FALLBACK_ORDER = [
    SetupSkillLevel.ALL_LEVELS,
    SetupSkillLevel.INTERMEDIATE,
    SetupSkillLevel.ADVANCED,
    SetupSkillLevel.BEGINNER,
    SetupSkillLevel.ESPORTS,
]
