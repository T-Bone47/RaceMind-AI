from __future__ import annotations

from datetime import UTC, datetime, timedelta

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from radio.delivery import deliver_next
from radio.models import RadioMessage
from radio.queue import RadioMessageQueue
from voice.base import ProviderNotConfiguredError, TextToSpeechProvider
from voice.service import VoiceService

_TEST_CONFIDENCE = fixed(0.9, "Fixture value - no test in this file asserts on confidence.")


def _rec(
    category: RecommendationCategory = RecommendationCategory.TYRE,
    priority: RecommendationPriority = RecommendationPriority.MEDIUM,
    message: str = "Test message",
) -> Recommendation:
    return Recommendation(
        category=category,
        priority=priority,
        confidence=_TEST_CONFIDENCE,
        message=message,
        reasoning="because a test says so",
    )


def _t(seconds: float) -> datetime:
    return datetime(2026, 1, 1, tzinfo=UTC) + timedelta(seconds=seconds)


# --- Conversion ---


def test_from_recommendation_preserves_category_priority_and_text():
    rec = _rec(category=RecommendationCategory.FUEL, priority=RecommendationPriority.HIGH, message="Box now")
    message = RadioMessage.from_recommendation(rec)

    assert message.category == RecommendationCategory.FUEL
    assert message.priority == RecommendationPriority.HIGH
    assert message.text == "Box now"
    assert message.id  # non-empty


def test_speech_payload_maps_priority_to_urgency():
    critical = RadioMessage.from_recommendation(_rec(priority=RecommendationPriority.CRITICAL))
    info = RadioMessage.from_recommendation(_rec(priority=RecommendationPriority.INFO))

    assert critical.to_speech_payload().urgency == "urgent"
    assert info.to_speech_payload().urgency == "calm"


# --- Prioritization ---


def test_enqueue_sorts_pending_by_priority_highest_first():
    queue = RadioMessageQueue()
    queue.enqueue(
        [
            _rec(priority=RecommendationPriority.LOW, message="low"),
            _rec(priority=RecommendationPriority.CRITICAL, message="critical"),
            _rec(priority=RecommendationPriority.MEDIUM, message="medium"),
        ]
    )

    ordered = [m.priority for m in queue.pending()]
    assert ordered == [
        RecommendationPriority.CRITICAL,
        RecommendationPriority.MEDIUM,
        RecommendationPriority.LOW,
    ]


def test_dequeue_returns_highest_priority_first():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(priority=RecommendationPriority.LOW), _rec(priority=RecommendationPriority.CRITICAL)])

    first = queue.dequeue()
    assert first is not None
    assert first.priority == RecommendationPriority.CRITICAL


def test_dequeue_on_empty_queue_returns_none():
    queue = RadioMessageQueue()
    assert queue.dequeue() is None


# --- Duplicate suppression ---


def test_exact_duplicate_is_not_enqueued_twice():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(category=RecommendationCategory.TYRE, message="Cliff in 3 laps")])
    added = queue.enqueue([_rec(category=RecommendationCategory.TYRE, message="Cliff in 3 laps")])

    assert added == []
    assert queue.pending_count() == 1


def test_same_category_different_wording_is_not_treated_as_a_duplicate():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(category=RecommendationCategory.TYRE, message="Cliff in 3 laps")])
    added = queue.enqueue([_rec(category=RecommendationCategory.TYRE, message="Cliff in 2 laps")])

    assert len(added) == 1  # new wording is new information, not a duplicate
    assert queue.pending_count() == 2


def test_duplicate_check_only_applies_to_pending_not_already_delivered():
    """Once a message is dequeued (delivered), the exact same wording
    firing again later is a legitimate re-alert (e.g. the condition is
    still true next tick), not a duplicate - dedup only prevents having
    the same alert sitting in the queue twice at once."""
    queue = RadioMessageQueue(throttle_seconds={RecommendationPriority.MEDIUM: 0.0})
    queue.enqueue([_rec(message="Still true")])
    queue.dequeue()

    added = queue.enqueue([_rec(message="Still true")], now=_t(100))
    assert len(added) == 1


def test_same_category_and_text_at_a_different_priority_is_not_a_duplicate():
    """Regression guard: an escalation (same category, same wording,
    higher priority) must never be silently dropped as a "duplicate" of
    an already-pending lower-priority message with coincidentally
    identical text - that would defeat the entire point of a
    *prioritized* queue. Caught by test_dequeue_returns_highest_priority_first
    failing when the fingerprint didn't include priority."""
    queue = RadioMessageQueue()
    queue.enqueue([_rec(category=RecommendationCategory.TYRE, priority=RecommendationPriority.LOW, message="Same text")])
    added = queue.enqueue(
        [_rec(category=RecommendationCategory.TYRE, priority=RecommendationPriority.CRITICAL, message="Same text")]
    )

    assert len(added) == 1
    assert queue.pending_count() == 2
    priorities = {m.priority for m in queue.pending()}
    assert RecommendationPriority.CRITICAL in priorities


# --- Throttling ---


def test_second_message_in_same_category_within_window_is_throttled():
    queue = RadioMessageQueue(throttle_seconds={RecommendationPriority.MEDIUM: 30.0})
    queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="a")], now=_t(0))
    queue.dequeue(now=_t(0))  # throttle clock starts at delivery, not enqueue

    added = queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="b")], now=_t(10))
    assert added == []


def test_message_after_throttle_window_elapses_is_allowed():
    queue = RadioMessageQueue(throttle_seconds={RecommendationPriority.MEDIUM: 30.0})
    queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="a")], now=_t(0))
    queue.dequeue(now=_t(0))

    added = queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="b")], now=_t(31))
    assert len(added) == 1


def test_critical_priority_is_never_throttled():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(category=RecommendationCategory.DAMAGE, priority=RecommendationPriority.CRITICAL, message="a")], now=_t(0))
    queue.dequeue(now=_t(0))

    added = queue.enqueue(
        [_rec(category=RecommendationCategory.DAMAGE, priority=RecommendationPriority.CRITICAL, message="b")],
        now=_t(0.1),
    )
    assert len(added) == 1


def test_throttle_is_per_category_not_global():
    queue = RadioMessageQueue(throttle_seconds={RecommendationPriority.MEDIUM: 30.0})
    queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="a")], now=_t(0))
    queue.dequeue(now=_t(0))

    # A different category firing immediately after should NOT be throttled
    # by fuel's cooldown.
    added = queue.enqueue([_rec(category=RecommendationCategory.TYRE, message="b")], now=_t(1))
    assert len(added) == 1


def test_throttle_measured_from_delivery_not_from_enqueue():
    """A message sitting in the queue un-delivered shouldn't start the
    throttle clock - only an actual dequeue (delivery) should."""
    queue = RadioMessageQueue(throttle_seconds={RecommendationPriority.MEDIUM: 30.0})
    queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="a")], now=_t(0))
    # Not dequeued yet - no delivery has happened, so nothing should be throttled.
    added = queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="a variant")], now=_t(5))
    assert len(added) == 1


# --- Queue bounds ---


def test_queue_is_capped_at_max_size_keeping_highest_priority():
    queue = RadioMessageQueue(max_queue_size=2)
    queue.enqueue(
        [
            _rec(priority=RecommendationPriority.LOW, message="low"),
            _rec(priority=RecommendationPriority.CRITICAL, message="critical"),
            _rec(priority=RecommendationPriority.HIGH, message="high"),
        ]
    )

    assert queue.pending_count() == 2
    kept = {m.priority for m in queue.pending()}
    assert RecommendationPriority.CRITICAL in kept
    assert RecommendationPriority.HIGH in kept
    assert RecommendationPriority.LOW not in kept


def test_clear_empties_the_queue():
    queue = RadioMessageQueue()
    queue.enqueue([_rec()])
    queue.clear()
    assert queue.pending_count() == 0


def test_peek_does_not_remove_or_affect_throttling():
    queue = RadioMessageQueue(throttle_seconds={RecommendationPriority.MEDIUM: 30.0})
    queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="a")], now=_t(0))

    peeked = queue.peek()
    assert peeked is not None
    assert queue.pending_count() == 1  # peek didn't remove it

    # Since peek() isn't a delivery, the category's throttle clock never started.
    added = queue.enqueue([_rec(category=RecommendationCategory.FUEL, message="b")], now=_t(1))
    assert len(added) == 1


# --- Delivery / TTS integration ---


class _FakeTTS(TextToSpeechProvider):
    async def synthesize(self, text: str) -> bytes:
        return f"AUDIO[{text}]".encode()


async def test_deliver_next_without_tts_provider_returns_no_audio():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(message="Box now")])
    voice_service = VoiceService()  # no providers configured

    result = await deliver_next(queue, voice_service)

    assert result is not None
    assert result.message.text == "Box now"
    assert result.audio is None


async def test_deliver_next_with_tts_provider_synthesizes_audio():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(message="Box now")])
    voice_service = VoiceService(tts=_FakeTTS())

    result = await deliver_next(queue, voice_service)

    assert result is not None
    assert result.audio == b"AUDIO[Box now]"


async def test_deliver_next_on_empty_queue_returns_none():
    queue = RadioMessageQueue()
    voice_service = VoiceService()
    assert await deliver_next(queue, voice_service) is None


async def test_deliver_next_speak_false_skips_synthesis_even_with_provider():
    queue = RadioMessageQueue()
    queue.enqueue([_rec(message="Box now")])
    voice_service = VoiceService(tts=_FakeTTS())

    result = await deliver_next(queue, voice_service, speak=False)

    assert result is not None
    assert result.audio is None


async def test_voice_service_still_raises_when_asked_to_speak_directly_without_a_provider():
    """Sanity check that radio/ didn't accidentally swallow the
    existing fail-closed behavior voice.service.VoiceService already has."""
    import pytest

    voice_service = VoiceService()
    with pytest.raises(ProviderNotConfiguredError):
        await voice_service.speak("test")
