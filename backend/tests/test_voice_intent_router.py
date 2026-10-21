from __future__ import annotations

import uuid

from database.models.enums import TyreCompound
from engineer.models import DRSContext, FuelState, TyreState
from radio.queue import RadioMessageQueue
from tests.engineer_state_fixtures import build_state
from voice.intents.context import ConversationContext
from voice.intents.models import HandlerContext, IntentType
from voice.intents.router import OllieRouter


def _ctx(state=None) -> HandlerContext:
    return HandlerContext(session_id=uuid.uuid4(), state=state or build_state(), coaching_service=None)


# --- Full dispatch, one representative case per intent type ---


async def test_router_dispatches_strategy_intent():
    router = OllieRouter(RadioMessageQueue())
    response = await router.handle_utterance("Should I pit?", _ctx())
    assert response.text != ""


async def test_router_dispatches_tyre_intent():
    router = OllieRouter(RadioMessageQueue())
    state = build_state(tyre_state=TyreState(compound=TyreCompound.SOFT, age_laps=25, wear_pct=92.0))
    response = await router.handle_utterance("How are my tyres?", _ctx(state))
    assert response.text != ""


async def test_router_dispatches_unknown_intent_without_hallucinating():
    router = OllieRouter(RadioMessageQueue())
    response = await router.handle_utterance("What's your favorite color?", _ctx())
    assert response.text == "Unable to confirm."


# --- Radio queue integration ---


async def test_router_enqueues_recommendations_onto_the_shared_radio_queue():
    queue = RadioMessageQueue()
    router = OllieRouter(queue)
    state = build_state(tyre_state=TyreState(compound=TyreCompound.SOFT, age_laps=25, wear_pct=92.0))
    await router.handle_utterance("How are my tyres?", _ctx(state))
    assert len(queue.pending()) >= 1


async def test_router_does_not_enqueue_for_unknown_intent():
    queue = RadioMessageQueue()
    router = OllieRouter(queue)
    await router.handle_utterance("What's your favorite color?", _ctx())
    assert queue.pending() == []


async def test_router_does_not_enqueue_for_telemetry_intent():
    queue = RadioMessageQueue()
    router = OllieRouter(queue)
    await router.handle_utterance("Gap ahead?", _ctx())
    assert queue.pending() == []


async def test_repeated_identical_question_still_answers_but_the_queue_dedupes():
    # A direct question always gets a spoken answer, even the second
    # time - the existing RadioMessageQueue's own dedup only affects
    # what reaches the queue, not what's spoken back to the driver.
    queue = RadioMessageQueue()
    router = OllieRouter(queue)
    state = build_state(fuel_state=FuelState(remaining_kg=3.0, consumption_per_lap_kg=2.0))
    ctx = _ctx(state)

    first = await router.handle_utterance("Fuel?", ctx)
    second = await router.handle_utterance("Fuel?", ctx)

    assert first.text == second.text
    assert first.text != ""
    assert len(queue.pending()) == 1  # the second enqueue was deduped by the existing queue


async def test_rapid_consecutive_different_questions_all_get_answered():
    queue = RadioMessageQueue()
    router = OllieRouter(queue)
    ctx = _ctx()
    responses = []
    for question in ("Fuel?", "Battery?", "Weather?", "Damage?"):
        responses.append(await router.handle_utterance(question, ctx))
    assert all(r.text != "" for r in responses)


# --- Follow-up resolution ---


async def test_why_follow_up_speaks_the_reasoning_of_the_last_answer():
    router = OllieRouter(RadioMessageQueue())
    ctx = _ctx()
    await router.handle_utterance("Should I pit?", ctx)
    why_response = await router.handle_utterance("Why?", ctx)
    assert why_response.text != ""
    assert why_response.to_enqueue == []


async def test_why_follow_up_with_no_prior_exchange_cannot_confirm():
    router = OllieRouter(RadioMessageQueue())
    response = await router.handle_utterance("Why?", _ctx())
    assert response.text == "Unable to confirm."


async def test_when_follow_up_after_strategy_question_gives_a_lap_number():
    router = OllieRouter(RadioMessageQueue())
    # No gaps set - isolates pit_window_advisor as the only contributor
    # to the strategy answer (undercut/overcut/push_conserve are all
    # gap-driven and produce nothing without one), so the primary
    # recommendation is unambiguously PIT_WINDOW.
    ctx = _ctx(build_state(gap_to_car_ahead_s=None, gap_to_car_behind_s=None))
    await router.handle_utterance("Should I pit?", ctx)
    when_response = await router.handle_utterance("When?", ctx)
    assert when_response.text.startswith("Lap ")


async def test_when_follow_up_with_no_prior_exchange_cannot_confirm():
    router = OllieRouter(RadioMessageQueue())
    response = await router.handle_utterance("When?", _ctx())
    assert response.text == "Unable to confirm."


async def test_when_follow_up_after_a_non_strategy_question_cannot_confirm():
    # "When" only has a concrete answer for pit-window context - asking
    # it after a fuel question shouldn't fabricate a lap number.
    router = OllieRouter(RadioMessageQueue())
    ctx = _ctx()
    await router.handle_utterance("Fuel?", ctx)
    when_response = await router.handle_utterance("When?", ctx)
    assert when_response.text == "Unable to confirm."


async def test_when_follow_up_uses_current_state_not_stale_state():
    # The lap number should reflect ctx.state at the time of the
    # follow-up, not whatever state existed when the original question
    # was asked - re-derived fresh via strategy.pit_window.calculate().
    router = OllieRouter(RadioMessageQueue())
    ctx = _ctx(build_state(current_lap=10, gap_to_car_ahead_s=None, gap_to_car_behind_s=None))
    await router.handle_utterance("Should I pit?", ctx)

    ctx.state = build_state(current_lap=30, gap_to_car_ahead_s=None, gap_to_car_behind_s=None)
    when_response = await router.handle_utterance("When?", ctx)
    assert when_response.text.startswith("Lap ")


# --- Conversation context ---


async def test_router_records_every_exchange_into_its_context():
    context = ConversationContext()
    router = OllieRouter(RadioMessageQueue(), context=context)
    await router.handle_utterance("Fuel?", _ctx())
    last = context.last()
    assert last is not None
    assert last.intent_type == IntentType.FUEL
    assert last.raw_text == "Fuel?"


async def test_follow_up_exchanges_are_also_recorded():
    context = ConversationContext()
    router = OllieRouter(RadioMessageQueue(), context=context)
    ctx = _ctx()
    await router.handle_utterance("Should I pit?", ctx)
    await router.handle_utterance("Why?", ctx)
    assert context.last().raw_text == "Why?"


async def test_two_routers_do_not_share_conversation_state():
    router_a = OllieRouter(RadioMessageQueue())
    router_b = OllieRouter(RadioMessageQueue())
    await router_a.handle_utterance("Should I pit?", _ctx())

    # router_b never heard a strategy question, so "Why?" has nothing
    # to explain.
    response = await router_b.handle_utterance("Why?", _ctx())
    assert response.text == "Unable to confirm."


async def test_two_routers_do_not_share_radio_queue_state():
    queue_a = RadioMessageQueue()
    queue_b = RadioMessageQueue()
    router_a = OllieRouter(queue_a)
    router_b = OllieRouter(queue_b)
    tyre_trouble = build_state(tyre_state=TyreState(compound=TyreCompound.SOFT, age_laps=25, wear_pct=92.0))
    fuel_trouble = build_state(fuel_state=FuelState(remaining_kg=2.0, consumption_per_lap_kg=2.0))

    await router_a.handle_utterance("How are my tyres?", _ctx(tyre_trouble))
    await router_b.handle_utterance("Fuel?", _ctx(fuel_trouble))

    # Each router's queue only ever saw its own router's traffic.
    assert len(queue_a.pending()) >= 1
    assert all(m.category == "tyre" for m in queue_a.pending())
    assert len(queue_b.pending()) >= 1
    assert all(m.category == "fuel" for m in queue_b.pending())


# --- Edge cases: missing data across every category ---


async def test_no_gap_data_reports_no_telemetry_not_a_crash():
    router = OllieRouter(RadioMessageQueue())
    state = build_state(gap_to_car_ahead_s=None, gap_to_car_behind_s=None)
    response = await router.handle_utterance("Gap ahead?", _ctx(state))
    assert response.text == "No telemetry available."


async def test_no_coaching_service_reports_no_session_data_not_a_crash():
    router = OllieRouter(RadioMessageQueue())
    response = await router.handle_utterance("How was Turn 4?", _ctx())
    assert response.text == "I don't have enough session data."


async def test_drs_disabled_gives_a_clear_answer_not_a_crash():
    router = OllieRouter(RadioMessageQueue())
    state = build_state(drs=DRSContext(enabled=False, in_zone=False, gap_to_car_ahead_s=None))
    response = await router.handle_utterance("Do I have DRS?", _ctx(state))
    assert response.text != ""
