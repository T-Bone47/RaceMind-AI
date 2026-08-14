from __future__ import annotations

from common.confidence import fixed
from engineer.models import (
    CarDamageState,
    DRSContext,
    ERSState,
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
)
from voice.intents import response_builder, templates


def _rec(
    category: RecommendationCategory,
    priority: RecommendationPriority,
    message: str = "msg",
    reasoning: str = "reason",
) -> Recommendation:
    return Recommendation(
        category=category, priority=priority, confidence=fixed(0.9, "test"), message=message, reasoning=reasoning
    )


# --- response_builder.build_response ---


def test_build_response_uses_the_message_verbatim():
    rec = _rec(RecommendationCategory.FUEL, RecommendationPriority.HIGH, message="Fuel margin is tight.")
    response = response_builder.build_response([rec], fallback="unused")
    assert response.text == "Fuel margin is tight."
    assert response.primary == rec
    assert response.to_enqueue == [rec]


def test_build_response_picks_the_highest_priority_recommendation():
    low = _rec(RecommendationCategory.TYRE, RecommendationPriority.LOW, message="low prio")
    critical = _rec(RecommendationCategory.TYRE, RecommendationPriority.CRITICAL, message="critical prio")
    medium = _rec(RecommendationCategory.TYRE, RecommendationPriority.MEDIUM, message="medium prio")

    response = response_builder.build_response([low, medium, critical], fallback="unused")

    assert response.text == "critical prio"
    assert response.primary == critical


def test_build_response_carries_every_recommendation_to_enqueue_not_just_the_spoken_one():
    low = _rec(RecommendationCategory.TYRE, RecommendationPriority.LOW)
    high = _rec(RecommendationCategory.TYRE, RecommendationPriority.HIGH)
    response = response_builder.build_response([low, high], fallback="unused")
    assert response.to_enqueue == [low, high]


def test_build_response_falls_back_when_no_recommendations():
    response = response_builder.build_response([], fallback="Tyres are good.")
    assert response.text == "Tyres are good."
    assert response.primary is None
    assert response.to_enqueue == []


# --- response_builder.build_reasoning_response ---


def test_build_reasoning_response_speaks_the_reasoning_not_the_message():
    rec = _rec(
        RecommendationCategory.PIT_WINDOW,
        RecommendationPriority.HIGH,
        message="Stay out.",
        reasoning="Traffic after pit exit.",
    )
    response = response_builder.build_reasoning_response(rec)
    assert response.text == "Traffic after pit exit."
    assert response.primary == rec


def test_build_reasoning_response_never_enqueues():
    rec = _rec(RecommendationCategory.PIT_WINDOW, RecommendationPriority.HIGH)
    response = response_builder.build_reasoning_response(rec)
    assert response.to_enqueue == []


def test_build_reasoning_response_falls_back_when_nothing_to_explain():
    response = response_builder.build_reasoning_response(None)
    assert response.text == templates.UNABLE_TO_CONFIRM
    assert response.primary is None


# --- templates ---


def test_damage_none_reports_zero_when_no_damage():
    damage = CarDamageState(front_wing_pct=0.0, rear_wing_pct=0.0, floor_pct=0.0, diffuser_pct=0.0, sidepod_pct=0.0)
    assert templates.damage_none(damage) == "No damage."


def test_damage_none_reports_the_measured_value_when_present():
    damage = CarDamageState(front_wing_pct=12.0, rear_wing_pct=0.0, floor_pct=0.0, diffuser_pct=0.0, sidepod_pct=0.0)
    text = templates.damage_none(damage)
    assert "12" in text
    assert text != "No damage."


def test_ers_status_reports_the_measured_charge():
    ers = ERSState(state_of_charge_pct=62.0)
    assert templates.ers_status(ers) == "Battery 62 percent."


def test_drs_status_not_enabled():
    drs = DRSContext(enabled=False, in_zone=False, gap_to_car_ahead_s=None)
    assert templates.drs_status(drs) == "DRS not enabled."


def test_drs_status_enabled_and_in_zone():
    drs = DRSContext(enabled=True, in_zone=True, gap_to_car_ahead_s=0.8)
    assert templates.drs_status(drs) == "DRS available."


def test_drs_status_enabled_but_no_zone():
    drs = DRSContext(enabled=True, in_zone=False, gap_to_car_ahead_s=None)
    assert templates.drs_status(drs) == "No DRS zone."


def test_static_fallback_phrases_match_the_spec_exactly():
    # These three are quoted verbatim in the Step 2 spec - never vary
    # them into something that sounds like a guess.
    assert templates.NO_SESSION_DATA == "I don't have enough session data."
    assert templates.UNABLE_TO_CONFIRM == "Unable to confirm."
    assert templates.NO_TELEMETRY == "No telemetry available."
