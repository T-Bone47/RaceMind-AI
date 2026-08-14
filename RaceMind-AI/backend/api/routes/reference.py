from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from starlette.concurrency import run_in_threadpool

from api.schemas.reference import (
    ComparisonRead,
    ComparisonRequest,
    ReferenceLapRead,
    SectorDeltaRead,
)
from auth.dependencies import get_current_user
from database.models.user import User
from reference import comparison as comparison_mod
from reference.fastf1_client import (
    NoReferenceDataError,
    ReferenceLap,
    get_driver_reference_lap,
    get_fastest_reference_lap,
)

router = APIRouter(prefix="/reference", tags=["Reference Data"])


def _to_read(lap: ReferenceLap) -> ReferenceLapRead:
    return ReferenceLapRead(**lap.__dict__)


@router.post("/compare", response_model=ComparisonRead)
async def compare_to_reference(
    payload: ComparisonRequest,
    _current_user: Annotated[User, Depends(get_current_user)],
) -> ComparisonRead:
    """Compares a live/game lap against a real F1 reference lap (FastF1).

    FastF1 is a synchronous library making real network calls (F1
    live-timing / jolpica-f1 APIs), so this runs off the event loop in
    a thread rather than blocking every other request while it fetches.
    """
    try:
        if payload.driver:
            reference = await run_in_threadpool(
                get_driver_reference_lap, payload.year, payload.event, payload.driver, payload.session
            )
        else:
            reference = await run_in_threadpool(
                get_fastest_reference_lap, payload.year, payload.event, payload.session
            )
    except NoReferenceDataError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    live = comparison_mod.LiveLapSummary(
        lap_time_s=payload.live_lap_time_s,
        sector_1_s=payload.live_sector_1_s,
        sector_2_s=payload.live_sector_2_s,
        sector_3_s=payload.live_sector_3_s,
        compound=payload.live_compound,
    )
    result = comparison_mod.compare_to_reference(live, reference)

    return ComparisonRead(
        reference=_to_read(reference),
        lap_time_delta_s=result.lap_time_delta_s,
        lap_time_pct=result.lap_time_pct,
        sector_deltas=[SectorDeltaRead(**d.__dict__) for d in result.sector_deltas],
        compound_note=result.compound_note,
        summary=comparison_mod.summarize(result),
    )
