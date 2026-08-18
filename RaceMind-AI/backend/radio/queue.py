"""RadioMessageQueue: takes Recommendations from the AI Race Engineer,
converts them to RadioMessages, and holds them for delivery -
prioritized, deduplicated, and throttled.

Two deliberately separate mechanisms, not one:
- Deduplication: refuses to enqueue a message that's an exact repeat
  (same category + same wording) of one already pending. Cheap, exact.
- Throttling: even non-identical messages in the same category (wear
  updates that tick down lap by lap, say) are rate-limited to at most
  one delivery per `throttle_seconds[priority]` window, tracked from
  the last time that category was actually *delivered* (dequeued), not
  merely enqueued. CRITICAL never throttles - a genuine safety-relevant
  call should never be suppressed by pacing logic.
"""

from __future__ import annotations

from datetime import UTC, datetime

from engineer.models import (
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
    priority_rank,
)
from radio.models import RadioMessage

DEFAULT_THROTTLE_SECONDS: dict[RecommendationPriority, float] = {
    RecommendationPriority.CRITICAL: 0.0,
    RecommendationPriority.HIGH: 15.0,
    RecommendationPriority.MEDIUM: 30.0,
    RecommendationPriority.LOW: 60.0,
    RecommendationPriority.INFO: 90.0,
}

DEFAULT_MAX_QUEUE_SIZE = 50


def _utcnow() -> datetime:
    return datetime.now(UTC)


class RadioMessageQueue:
    def __init__(
        self,
        throttle_seconds: dict[RecommendationPriority, float] | None = None,
        max_queue_size: int = DEFAULT_MAX_QUEUE_SIZE,
    ) -> None:
        self._pending: list[RadioMessage] = []
        self._last_delivered_at: dict[RecommendationCategory, datetime] = {}
        self._throttle_seconds = throttle_seconds or DEFAULT_THROTTLE_SECONDS
        self._max_queue_size = max_queue_size

    def enqueue(
        self, recommendations: list[Recommendation], *, now: datetime | None = None
    ) -> list[RadioMessage]:
        """Converts, filters (dedup + throttle), and adds to the queue.
        Returns only the messages that were actually added, so callers
        (and tests) can tell what got suppressed and why by checking
        what's missing from the return value vs. the input."""
        now = now or _utcnow()
        added: list[RadioMessage] = []

        for recommendation in recommendations:
            message = RadioMessage.from_recommendation(recommendation)
            if self._is_duplicate_pending(message):
                continue
            if self._is_throttled(message, now):
                continue
            self._pending.append(message)
            added.append(message)

        self._pending.sort(key=lambda m: priority_rank(m.priority), reverse=True)
        if len(self._pending) > self._max_queue_size:
            self._pending = self._pending[: self._max_queue_size]

        return added

    def dequeue(self, *, now: datetime | None = None) -> RadioMessage | None:
        """Pops the highest-priority pending message and marks its
        category as just-delivered for throttle purposes. Call this
        (not `peek`) when a message is actually about to be spoken -
        throttling is measured from delivery, not from when it queued."""
        if not self._pending:
            return None
        now = now or _utcnow()
        message = self._pending.pop(0)
        self._last_delivered_at[message.category] = now
        return message

    def peek(self) -> RadioMessage | None:
        return self._pending[0] if self._pending else None

    def pending(self) -> list[RadioMessage]:
        return list(self._pending)

    def pending_count(self) -> int:
        return len(self._pending)

    def clear(self) -> None:
        self._pending.clear()

    def _is_duplicate_pending(self, message: RadioMessage) -> bool:
        return any(m.fingerprint == message.fingerprint for m in self._pending)

    def _is_throttled(self, message: RadioMessage, now: datetime) -> bool:
        threshold = self._throttle_seconds.get(message.priority, 0.0)
        if threshold <= 0:
            return False  # CRITICAL by default - never throttled

        last_delivered = self._last_delivered_at.get(message.category)
        if last_delivered is None:
            return False  # nothing in this category has ever gone out

        elapsed = (now - last_delivered).total_seconds()
        return elapsed < threshold
