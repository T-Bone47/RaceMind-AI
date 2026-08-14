"""Confidence scoring shared across advisory modules (coaching/,
engineer/). Extracted here rather than duplicated in each - both need
"how much data backs this claim" scoring, and it's the same math either
way: a tyre-cliff prediction from 15 laps of wear data isn't more or
less "confidence" as a concept than a corner-braking pattern from 5 laps.
"""

from __future__ import annotations

from dataclasses import dataclass

_MIN_CONFIDENCE = 0.15


@dataclass(frozen=True)
class ConfidenceScore:
    """0.0-1.0. Attached to individual recommendations/insights so a
    consumer (UI, AI Engineer voice line, driver) can tell a
    well-supported claim from a first observation."""

    value: float
    reason: str


def from_sample_count(count: int, *, full_confidence_at: int, label: str) -> ConfidenceScore:
    """`full_confidence_at`: sample count at which confidence reaches
    1.0. Below that, confidence scales linearly, floored at
    _MIN_CONFIDENCE so a single-sample observation is never reported as
    "zero confidence" (it's still worth mentioning, just caveated)."""
    if count <= 0:
        return ConfidenceScore(value=0.0, reason=f"No {label} data available.")

    raw = count / full_confidence_at
    value = round(min(max(raw, _MIN_CONFIDENCE), 1.0), 2)

    if count >= full_confidence_at:
        reason = f"Based on {count} {label} - a solid sample."
    elif count == 1:
        reason = f"Based on a single {label} - treat this as a first observation, not a pattern yet."
    else:
        reason = f"Based on {count} {label} - a pattern is forming but more data would firm this up."

    return ConfidenceScore(value=value, reason=reason)


def fixed(value: float, reason: str) -> ConfidenceScore:
    """For advisors reasoning from a direct telemetry reading (current
    ERS state of charge, track status, damage percentage) rather than a
    prediction - there's no "sample count" to scale from, but the
    confidence is still meaningful to report (typically high, since it's
    measured, not inferred)."""
    return ConfidenceScore(value=round(min(max(value, 0.0), 1.0), 2), reason=reason)
