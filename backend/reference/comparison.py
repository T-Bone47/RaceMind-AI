""""Complete package" comparison: how does a live/game lap stack up
against a real F1 reference lap for the same event.

Deliberately narrow - this compares pace and sector splits, which is
what's actually comparable between a sim session and a real one. It
does not claim to compare car setup, aero, or strategy against the real
car, since a game telemetry frame and a real FIA timing record aren't
measuring the same underlying physical car; presenting that as directly
comparable would be exactly the kind of unverified claim the brief
asked to avoid.
"""

from __future__ import annotations

from dataclasses import dataclass

from reference.fastf1_client import ReferenceLap


@dataclass(frozen=True)
class LiveLapSummary:
    """The subset of a live/game lap this module needs - callers build
    this from `database.models.lap.Lap` + the matching `TyreStint`,
    not from a wire format directly."""

    lap_time_s: float
    sector_1_s: float | None
    sector_2_s: float | None
    sector_3_s: float | None
    compound: str | None


@dataclass(frozen=True)
class SectorDelta:
    sector: int
    live_s: float | None
    reference_s: float | None
    delta_s: float | None  # live - reference; negative = live was faster


@dataclass(frozen=True)
class PackageComparison:
    live: LiveLapSummary
    reference: ReferenceLap
    lap_time_delta_s: float  # live - reference; negative = live was faster
    lap_time_pct: float  # delta as a percentage of the reference lap time
    sector_deltas: list[SectorDelta]
    compound_note: str | None


def compare_to_reference(live: LiveLapSummary, reference: ReferenceLap) -> PackageComparison:
    delta = live.lap_time_s - reference.lap_time_s
    pct = (delta / reference.lap_time_s) * 100 if reference.lap_time_s else 0.0

    sector_deltas = [
        _sector_delta(1, live.sector_1_s, reference.sector_1_s),
        _sector_delta(2, live.sector_2_s, reference.sector_2_s),
        _sector_delta(3, live.sector_3_s, reference.sector_3_s),
    ]

    compound_note = None
    if live.compound and reference.compound and live.compound.lower() != reference.compound.lower():
        compound_note = (
            f"Reference lap was set on {reference.compound.title()} - "
            f"not a like-for-like tyre comparison with your {live.compound.title()}."
        )

    return PackageComparison(
        live=live,
        reference=reference,
        lap_time_delta_s=round(delta, 3),
        lap_time_pct=round(pct, 2),
        sector_deltas=sector_deltas,
        compound_note=compound_note,
    )


def _sector_delta(sector: int, live_s: float | None, reference_s: float | None) -> SectorDelta:
    delta = (live_s - reference_s) if (live_s is not None and reference_s is not None) else None
    return SectorDelta(
        sector=sector,
        live_s=live_s,
        reference_s=reference_s,
        delta_s=round(delta, 3) if delta is not None else None,
    )


def summarize(comparison: PackageComparison) -> str:
    """One-line, radio-length summary - the shape the AI Engineer would
    actually say over comms, not a data dump."""
    ref = comparison.reference
    sign = "+" if comparison.lap_time_delta_s >= 0 else ""
    verdict = "off" if comparison.lap_time_delta_s > 0 else "quicker than"
    return (
        f"{sign}{comparison.lap_time_delta_s:.3f}s {verdict} "
        f"{ref.driver}'s {ref.year} {ref.session_name} lap at {ref.event_name} "
        f"({comparison.lap_time_pct:+.2f}%)."
    )
