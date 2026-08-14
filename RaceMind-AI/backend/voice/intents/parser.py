"""Detects which of Ollie's known question types a driver's transcribed
speech matches, or that it's a short follow-up asking for more detail
about the answer Ollie just gave.

Deliberately keyword-based rather than an LLM classifier: intent
routing needs to be fast, deterministic, and testable the same way
every other piece of this project is, and the question vocabulary a
driver actually uses over a race radio is narrow enough that this
covers it without adding an LLM call's latency, cost, and
nondeterminism to a decision everything downstream depends on.
Extending the covered phrasing later just means adding keywords to
_INTENT_KEYWORDS, not rearchitecting anything.
"""

from __future__ import annotations

import re

from voice.intents.models import FollowUpType, IntentType, ParsedIntent

_INTENT_KEYWORDS: dict[IntentType, tuple[str, ...]] = {
    IntentType.STRATEGY: ("pit", "box", "strategy", "undercut", "overcut", "stay out"),
    IntentType.SESSION: ("laps left", "laps remaining", "how many laps", "laps to go"),
    IntentType.TYRE: ("tyre", "tire", "grip", "wear"),
    IntentType.FUEL: ("fuel", "gas"),
    IntentType.WEATHER: ("weather", "rain", "dry", "wet", "track condition"),
    IntentType.ERS: ("battery", "ers", "energy", "harvest", "deploy", "charge"),
    IntentType.DRS: ("drs",),
    IntentType.DAMAGE: ("damage", "broken"),
    IntentType.COACHING: ("turn", "corner", "brake", "braking", "apex", "how was"),
    IntentType.TELEMETRY: ("gap", "behind", "ahead", "position", "sector", "lap time", "delta"),
}

# Checked in this order - SESSION's "how many laps" is tried before a
# looser TELEMETRY match could claim it, and STRATEGY first since "pit"
# questions are the most time-critical to route correctly.
_INTENT_CHECK_ORDER: tuple[IntentType, ...] = (
    IntentType.STRATEGY,
    IntentType.SESSION,
    IntentType.TYRE,
    IntentType.FUEL,
    IntentType.WEATHER,
    IntentType.ERS,
    IntentType.DRS,
    IntentType.DAMAGE,
    IntentType.COACHING,
    IntentType.TELEMETRY,
)

_WHY_WORDS = frozenset({"why"})
_WHEN_WORDS = frozenset({"when"})
_MAX_FOLLOW_UP_WORDS = 4  # "why" buried in a longer question is a new question, not a follow-up


def parse(raw_text: str) -> ParsedIntent:
    text = raw_text.strip().lower()

    follow_up = _match_follow_up(text)
    if follow_up is not None:
        return ParsedIntent(intent_type=IntentType.UNKNOWN, raw_text=raw_text, follow_up=follow_up)

    for intent_type in _INTENT_CHECK_ORDER:
        if _matches_any(text, _INTENT_KEYWORDS[intent_type]):
            return ParsedIntent(intent_type=intent_type, raw_text=raw_text)

    return ParsedIntent(intent_type=IntentType.UNKNOWN, raw_text=raw_text)


def _matches_any(text: str, keywords: tuple[str, ...]) -> bool:
    return any(_contains(text, keyword) for keyword in keywords)


def _contains(text: str, phrase: str) -> bool:
    # Leading word-boundary only, no trailing one - "tyre" should also
    # match "tyres", "rain" should also match "raining", without having
    # to enumerate every inflection as its own keyword.
    return re.search(rf"\b{re.escape(phrase)}", text) is not None


def _match_follow_up(text: str) -> FollowUpType | None:
    words = text.rstrip("?.!").split()
    if len(words) > _MAX_FOLLOW_UP_WORDS:
        return None
    if any(word in _WHY_WORDS for word in words):
        return FollowUpType.WHY
    if any(word in _WHEN_WORDS for word in words):
        return FollowUpType.WHEN
    return None
