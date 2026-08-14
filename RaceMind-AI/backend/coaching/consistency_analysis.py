"""Lap-time consistency scoring.

Deliberately self-contained rather than reusing
ai.driver_profile's similar-looking calculation - that one scores a
long-term, cross-session profile; this one scores a single session's
coaching report. Keeping them separate means neither has to change if
the other does, at the cost of a small amount of duplicated statistics.
"""

from __future__ import annotations

import statistics

from coaching.models import ConsistencyScore
from common.confidence import from_sample_count

_STDEV_MS_FOR_ZERO_SCORE = 2000.0  # 2s of lap-to-lap variance maps to a 0 score
_FULL_CONFIDENCE_LAP_COUNT = 8


def score(lap_times_ms: list[int]) -> ConsistencyScore:
    clean = [t for t in lap_times_ms if t > 0]

    if len(clean) < 2:
        return ConsistencyScore(
            score_0_100=50.0,
            lap_time_stdev_ms=0.0,
            lap_count=len(clean),
            confidence=from_sample_count(len(clean), full_confidence_at=_FULL_CONFIDENCE_LAP_COUNT, label="lap"),
        )

    stdev = statistics.pstdev(clean)
    raw_score = 100.0 * (1 - stdev / _STDEV_MS_FOR_ZERO_SCORE)
    clamped_score = round(max(0.0, min(100.0, raw_score)), 1)

    return ConsistencyScore(
        score_0_100=clamped_score,
        lap_time_stdev_ms=round(stdev, 1),
        lap_count=len(clean),
        confidence=from_sample_count(len(clean), full_confidence_at=_FULL_CONFIDENCE_LAP_COUNT, label="lap"),
    )
