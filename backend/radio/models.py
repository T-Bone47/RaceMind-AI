"""Message types for the radio queue.

`RadioMessage` is deliberately a separate type from
`engineer.models.Recommendation` rather than reusing it directly - the
queue's job (identity, throttling, delivery bookkeeping) is a different
concern from the advisor's job (deciding what's worth saying), and
keeping them separate means the queue doesn't need to change if
Recommendation's shape does, or if a second message source (e.g. a
driver-initiated question via ai.llm) needs to feed the same queue later.
"""

from __future__ import annotations

import hashlib
import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime

from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority


def _utcnow() -> datetime:
    return datetime.now(UTC)


@dataclass(frozen=True)
class SpeechPayload:
    """What a future TTS integration consumes - see
    voice.service.VoiceService.speak(text: str), which this is designed
    to feed directly. `urgency` is a hint for future prosody control
    (speaking rate/pitch) that today's VoiceService doesn't use yet, but
    the contract is defined now rather than bolted on later."""

    text: str
    urgency: str  # "urgent" | "normal" | "calm"


_URGENCY_BY_PRIORITY: dict[RecommendationPriority, str] = {
    RecommendationPriority.CRITICAL: "urgent",
    RecommendationPriority.HIGH: "urgent",
    RecommendationPriority.MEDIUM: "normal",
    RecommendationPriority.LOW: "calm",
    RecommendationPriority.INFO: "calm",
}


@dataclass(frozen=True)
class RadioMessage:
    id: str
    category: RecommendationCategory
    priority: RecommendationPriority
    text: str
    reasoning: str
    fingerprint: str
    created_at: datetime = field(default_factory=_utcnow)

    @classmethod
    def from_recommendation(cls, recommendation: Recommendation) -> RadioMessage:
        return cls(
            id=str(uuid.uuid4()),
            category=recommendation.category,
            priority=recommendation.priority,
            text=recommendation.message,
            reasoning=recommendation.reasoning,
            fingerprint=_fingerprint(recommendation.category, recommendation.priority, recommendation.message),
        )

    def to_speech_payload(self) -> SpeechPayload:
        return SpeechPayload(text=self.text, urgency=_URGENCY_BY_PRIORITY[self.priority])


def _fingerprint(category: RecommendationCategory, priority: RecommendationPriority, text: str) -> str:
    """Identity for duplicate detection - same category + same priority +
    same exact wording is the same alert. Priority is deliberately part
    of the fingerprint: a CRITICAL message must never be silently
    suppressed as a "duplicate" just because a LOWER-priority message
    with coincidentally identical text is already pending - that would
    undermine the whole point of a *prioritized* queue. A different
    wording in the same category (e.g. "cliff in 3 laps" -> "cliff in 2
    laps") is intentionally still a different fingerprint too, since
    that's new information even though it's throttled the same way -
    see queue.py for why duplication and throttling are separate
    mechanisms."""
    digest = hashlib.sha256(f"{category.value}:{priority.value}:{text}".encode()).hexdigest()
    return digest[:16]
