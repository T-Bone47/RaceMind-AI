from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from voice.intents.context import ConversationContext, Exchange
from voice.intents.models import IntentType


def _make_exchange(text: str = "Stay out.") -> Exchange:
    return Exchange(
        intent_type=IntentType.STRATEGY,
        raw_text="Should I pit?",
        response_text=text,
        recommendation=Recommendation(
            category=RecommendationCategory.PIT_WINDOW,
            priority=RecommendationPriority.HIGH,
            confidence=fixed(0.9, "test"),
            message=text,
            reasoning="Traffic after pit exit.",
        ),
    )


def test_empty_context_has_no_last_exchange():
    assert ConversationContext().last() is None


def test_records_and_recalls_the_last_exchange():
    ctx = ConversationContext()
    exchange = _make_exchange()
    ctx.record(exchange)
    assert ctx.last() == exchange


def test_last_reflects_the_most_recent_of_several_exchanges():
    ctx = ConversationContext()
    ctx.record(_make_exchange("first"))
    ctx.record(_make_exchange("second"))
    assert ctx.last().response_text == "second"


def test_history_is_bounded_and_forgets_older_exchanges():
    ctx = ConversationContext(max_history=2)
    ctx.record(_make_exchange("one"))
    ctx.record(_make_exchange("two"))
    ctx.record(_make_exchange("three"))
    assert len(ctx._history) == 2
    assert ctx._history[0].response_text == "two"
    assert ctx.last().response_text == "three"


def test_clear_removes_all_history():
    ctx = ConversationContext()
    ctx.record(_make_exchange())
    ctx.clear()
    assert ctx.last() is None
