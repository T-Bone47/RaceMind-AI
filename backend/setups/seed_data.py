"""RaceMind AI's own baseline setups - starting points grounded in real
aero/mechanical principles, not scraped or claimed lap-time-verified
data (see the project brief's own "avoid speculative or unverified
setups" constraint).

These go through the same SetupImporter interface as any external
source (see importers/base.py) rather than being special-cased, so
they're a working example of the import architecture as much as they
are real seed data.

Every value here is a REASONED STARTING POINT for the stated engineering
rationale, explicitly not a claim about optimal lap time. The AI Setup
Engine (a future pass) is what's meant to refine these toward an
individual driver's actual feedback and telemetry - this seed data's
job is to not start from zero.
"""

from __future__ import annotations

from database.models.enums import SessionType, SetupInputDevice, SetupSkillLevel, SetupWeather
from setups.importers.base import SetupImportRecord
from telemetry.models import GameTitle

# Wing scale: 0 (min downforce/drag) - 50 (max downforce/drag), matching
# the in-game slider range. Camber in degrees (negative = top-in).
# Suspension/ARB: 1 (soft) - 41/21 (stiff). Ride height: lower = stiffer
# floor seal, higher risk of plank wear on bumpy kerbs.

_MONACO_RATIONALE = (
    "Monaco has no meaningful straight and is defined entirely by low-speed "
    "corners and kerb-riding through the chicane - so this starts near max "
    "front/rear wing (mechanical+aero grip matters far more than drag here), "
    "moderately stiff suspension for quick direction changes without "
    "skipping over the kerbs, and a forward-biased brake balance for the "
    "sharp, low-speed braking zones (Turn 1, Loews hairpin)."
)

_MONZA_RATIONALE = (
    "Monza is the opposite case - the longest flat-out sections on the "
    "calendar make drag the dominant lap-time factor, so this starts near "
    "minimum front/rear wing even at the cost of some grip through Lesmo "
    "and Parabolica, with a low ride height since Monza's smooth tarmac "
    "carries little bottoming-out risk even at low downforce."
)


def _baseline(
    *,
    track_name: str,
    session_type: SessionType,
    input_device: SetupInputDevice,
    skill_level: SetupSkillLevel,
    front_wing: int,
    rear_wing: int,
    front_suspension: int,
    rear_suspension: int,
    front_ride_height: int,
    rear_ride_height: int,
    brake_bias: int,
    rationale: str,
) -> SetupImportRecord:
    return SetupImportRecord(
        game=GameTitle.F1_25_2026_DLC,
        track_name=track_name,
        session_type=session_type,
        weather=SetupWeather.DRY,
        input_device=input_device,
        skill_level=skill_level,
        name=f"{track_name} - {session_type.value.title()} baseline",
        front_wing=front_wing,
        rear_wing=rear_wing,
        diff_on_throttle=60,
        diff_off_throttle=55,
        front_camber=-2.80,
        rear_camber=-1.60,
        front_toe=0.05,
        rear_toe=0.15,
        front_suspension=front_suspension,
        rear_suspension=rear_suspension,
        front_anti_roll_bar=11,
        rear_anti_roll_bar=11,
        front_ride_height=front_ride_height,
        rear_ride_height=rear_ride_height,
        brake_pressure=95,
        brake_bias=brake_bias,
        engine_braking=60,
        tyre_pressure_fl=23.0,
        tyre_pressure_fr=23.0,
        tyre_pressure_rl=21.5,
        tyre_pressure_rr=21.5,
        ballast=0,
        fuel_load=0.0,
        notes=rationale,
        source_attribution="RaceMind AI baseline - engineering-principle starting point, not lap-time-verified",
    )


class SeedDataImporter:
    """Ships RaceMind AI's own baseline setups through the standard
    SetupImporter interface - see importers/base.py."""

    source_name = "racemind_baseline"

    async def fetch(self, game: GameTitle, track_name: str) -> list[SetupImportRecord]:
        if game != GameTitle.F1_25_2026_DLC:
            return []

        records: list[SetupImportRecord] = []
        if track_name == "Monaco":
            for session_type in (SessionType.QUALIFYING, SessionType.RACE):
                for device in (SetupInputDevice.WHEEL, SetupInputDevice.CONTROLLER):
                    records.append(
                        _baseline(
                            track_name="Monaco",
                            session_type=session_type,
                            input_device=device,
                            skill_level=SetupSkillLevel.INTERMEDIATE,
                            front_wing=48,
                            rear_wing=50,
                            front_suspension=24,
                            rear_suspension=22,
                            front_ride_height=6,
                            rear_ride_height=8,
                            brake_bias=58,
                            rationale=_MONACO_RATIONALE,
                        )
                    )
        elif track_name == "Monza":
            for session_type in (SessionType.QUALIFYING, SessionType.RACE):
                for device in (SetupInputDevice.WHEEL, SetupInputDevice.CONTROLLER):
                    records.append(
                        _baseline(
                            track_name="Monza",
                            session_type=session_type,
                            input_device=device,
                            skill_level=SetupSkillLevel.INTERMEDIATE,
                            front_wing=10,
                            rear_wing=6,
                            front_suspension=18,
                            rear_suspension=16,
                            front_ride_height=3,
                            rear_ride_height=5,
                            brake_bias=54,
                            rationale=_MONZA_RATIONALE,
                        )
                    )

        return [r for r in records if r.track_name == track_name]
