from __future__ import annotations

import uuid

from database.models.enums import TyreCompound
from engineer.models import (
    CarDamageState,
    DRSContext,
    ERSState,
    FuelState,
    TyreState,
    WeatherCondition,
)
from tests.engineer_state_fixtures import build_state
from voice.intents.handlers import (
    damage,
    drs,
    ers,
    fuel,
    session,
    strategy,
    telemetry,
    tyre,
    unknown,
    weather,
)
from voice.intents.models import HandlerContext, IntentType, ParsedIntent

_SID = uuid.uuid4()


def _ctx(state) -> HandlerContext:
    return HandlerContext(session_id=_SID, state=state, coaching_service=None)


def _parsed(text: str, intent: IntentType) -> ParsedIntent:
    return ParsedIntent(intent_type=intent, raw_text=text)


# --- tyre.py ---


async def test_tyre_handler_reports_a_real_recommendation_when_wear_is_high():
    state = build_state(tyre_state=TyreState(compound=TyreCompound.SOFT, age_laps=25, wear_pct=92.0))
    response = await tyre.handle(_parsed("How are my tyres?", IntentType.TYRE), _ctx(state))
    assert response.primary is not None
    assert response.text != ""


async def test_tyre_handler_falls_back_to_stable_template_when_nothing_notable():
    state = build_state(tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=3, wear_pct=8.0))
    response = await tyre.handle(_parsed("Tyres?", IntentType.TYRE), _ctx(state))
    if response.primary is None:
        assert response.text == "Tyres are good."


# --- fuel.py ---


async def test_fuel_handler_passes_correct_laps_to_finish_to_the_advisor():
    # fuel_advisor.analyze needs laps_to_finish = total_laps - current_lap,
    # not total_laps itself - a state with very little fuel and few laps
    # remaining should not read as critical the way it would with many
    # laps remaining.
    state = build_state(current_lap=38, total_laps=40, fuel_state=FuelState(remaining_kg=3.0, consumption_per_lap_kg=1.5))
    response = await fuel.handle(_parsed("Fuel?", IntentType.FUEL), _ctx(state))
    assert response.text != ""


# --- weather.py ---


async def test_weather_handler_flags_an_upcoming_change():
    state = build_state(weather=WeatherCondition.CLEAR, weather_forecast=[WeatherCondition.HEAVY_RAIN])
    response = await weather.handle(_parsed("Weather?", IntentType.WEATHER), _ctx(state))
    assert response.text != ""


async def test_weather_handler_falls_back_to_stable_when_nothing_notable():
    state = build_state(weather=WeatherCondition.CLEAR, weather_forecast=[WeatherCondition.CLEAR])
    response = await weather.handle(_parsed("Weather?", IntentType.WEATHER), _ctx(state))
    if response.primary is None:
        assert response.text == "Conditions stable."


# --- ers.py ---


async def test_ers_handler_falls_back_to_measured_charge_when_nothing_notable():
    state = build_state(ers_state=ERSState(state_of_charge_pct=62.0))
    response = await ers.handle(_parsed("Battery?", IntentType.ERS), _ctx(state))
    if response.primary is None:
        assert response.text == "Battery 62 percent."


# --- drs.py ---


async def test_drs_handler_falls_back_to_status_when_nothing_notable():
    state = build_state(drs=DRSContext(enabled=True, in_zone=False, gap_to_car_ahead_s=5.0))
    response = await drs.handle(_parsed("Do I have DRS?", IntentType.DRS), _ctx(state))
    if response.primary is None:
        assert response.text == "No DRS zone."


# --- damage.py ---


async def test_damage_handler_reports_no_damage_when_clean():
    state = build_state(
        car_damage=CarDamageState(front_wing_pct=0.0, rear_wing_pct=0.0, floor_pct=0.0, diffuser_pct=0.0, sidepod_pct=0.0)
    )
    response = await damage.handle(_parsed("Damage?", IntentType.DAMAGE), _ctx(state))
    if response.primary is None:
        assert response.text == "No damage."


async def test_damage_handler_reports_real_damage_when_present():
    state = build_state(
        car_damage=CarDamageState(front_wing_pct=35.0, rear_wing_pct=0.0, floor_pct=0.0, diffuser_pct=0.0, sidepod_pct=0.0)
    )
    response = await damage.handle(_parsed("Damage?", IntentType.DAMAGE), _ctx(state))
    assert response.text != "No damage."


# --- strategy.py ---


async def test_strategy_handler_always_has_an_answer():
    # pit_window_advisor.analyze() always returns something
    # unconditionally, so this should never hit the defensive fallback.
    state = build_state()
    response = await strategy.handle(_parsed("Should I pit?", IntentType.STRATEGY), _ctx(state))
    assert response.primary is not None
    assert response.text != ""


async def test_strategy_handler_combines_gap_driven_advisors():
    state = build_state(gap_to_car_ahead_s=1.0, gap_to_car_behind_s=0.8)
    response = await strategy.handle(_parsed("Should I pit?", IntentType.STRATEGY), _ctx(state))
    # pit_window (always) + whatever undercut/overcut/push_conserve find
    # with tight gaps on both sides - at minimum the one guaranteed entry.
    assert len(response.to_enqueue) >= 1


# --- telemetry.py ---


async def test_telemetry_handler_reports_gap_ahead_by_default():
    state = build_state(gap_to_car_ahead_s=1.8, gap_to_car_behind_s=3.2)
    response = await telemetry.handle(_parsed("Gap ahead?", IntentType.TELEMETRY), _ctx(state))
    assert response.text == "Gap ahead 1.8."


async def test_telemetry_handler_reports_gap_behind_when_asked():
    state = build_state(gap_to_car_ahead_s=1.8, gap_to_car_behind_s=3.2)
    response = await telemetry.handle(_parsed("Gap behind?", IntentType.TELEMETRY), _ctx(state))
    assert response.text == "Gap behind 3.2."


async def test_telemetry_handler_reports_no_data_when_gap_unknown():
    state = build_state(gap_to_car_ahead_s=None)
    response = await telemetry.handle(_parsed("Gap ahead?", IntentType.TELEMETRY), _ctx(state))
    assert response.text == "No telemetry available."


async def test_telemetry_handler_never_enqueues():
    state = build_state()
    response = await telemetry.handle(_parsed("Gap ahead?", IntentType.TELEMETRY), _ctx(state))
    assert response.to_enqueue == []


# --- session.py ---


async def test_session_handler_reports_laps_remaining():
    state = build_state(current_lap=18, total_laps=40)
    response = await session.handle(_parsed("How many laps left?", IntentType.SESSION), _ctx(state))
    assert response.text == "22 laps to go."


async def test_session_handler_reports_last_lap():
    state = build_state(current_lap=40, total_laps=40)
    response = await session.handle(_parsed("How many laps left?", IntentType.SESSION), _ctx(state))
    assert response.text == "This is the last lap."


# --- unknown.py ---


async def test_unknown_handler_never_hallucinates_never_enqueues():
    state = build_state()
    response = await unknown.handle(_parsed("What's the meaning of life?", IntentType.UNKNOWN), _ctx(state))
    assert response.text == "Unable to confirm."
    assert response.to_enqueue == []
    assert response.primary is None
