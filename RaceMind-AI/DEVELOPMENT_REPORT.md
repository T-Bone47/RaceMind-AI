# RaceMind AI — Development Report

**Generated:** urgent snapshot, mid-development. This zip contains everything built so far —
finished, verified modules AND in-progress/incomplete ones. Nothing was polished or hidden
before packaging; this document tells you exactly which is which.

## Precise state at the moment of this zip

```
Backend tests:  86 passed, 38 failed   (pytest)
Type checking:  19 errors in 6 files   (mypy)
Lint:           clean                  (ruff)
```

**All 38 test failures and all 19 mypy errors share one root cause**, not scattered bugs:
`engineer/models.py`'s `Recommendation` dataclass just gained a required `confidence` field,
and the rollout to every call site isn't finished yet. Exact remaining files:

- `engineer/fuel_advisor.py`
- `engineer/flag_advisor.py`
- `engineer/drs_advisor.py`
- `engineer/damage_advisor.py`
- `engineer/weather_advisor.py`
- `tests/test_radio_queue.py` (its `_rec()` helper constructs `Recommendation` directly)

Already fixed: `engineer/tyre_advisor.py`, `engineer/pit_window_advisor.py`,
`engineer/ers_advisor.py`. **The fix pattern is identical for all six remaining files** — add
a `confidence=` argument to every `Recommendation(...)` call, using `common.confidence.fixed()`
for direct telemetry readings (ERS/DRS/flags/damage — already the pattern in the 3 fixed files)
or a data-richness-based confidence where one exists. This is mechanical, not a design problem.

---

## What's fully built and verified

### Backend foundation
- **config/** — Pydantic Settings, logging
- **database/** — async SQLAlchemy 2.0, 9 models (User, RaceSession, Lap, TyreStint, FuelLog,
  StrategyPlan, DriverProfile, TelemetryFrameRecord, CircuitSetup), repository-per-aggregate,
  naming-convention-driven Alembic migrations
- **auth/** — JWT + bcrypt, `get_current_user` dependency
- **api/** — FastAPI app factory, global exception handler + request-ID logging middleware,
  22 REST routes across auth/users/sessions/telemetry/strategy/ai/voice/reference/setups
- Verified via a **real end-to-end run**: Postgres + uvicorn, register → login → create session
  → record telemetry → strategy engine computes a real pit-window recommendation from that data
  → AI Engineer fails closed correctly with no API key configured

### Telemetry (`telemetry/`)
- Real, byte-verified UDP parsing for **F1 24, F1 25, F1 26** (not stubs) — every struct format
  was cross-checked against the official spec's stated packet sizes before being trusted
  (F1 26 in particular: 22→24 car cap increase, `engineTemperature` uint16→uint8, both verified
  to compute the exact documented byte totals). F1 15-23 remain honest, registered-but-
  unimplemented stubs — never guessed at.
- Real asyncio UDP transport, replay/recorder pair, pub/sub provider abstraction
- `docs/TELEMETRY_SETUP.md` — real PC/Xbox/PlayStation network configuration guide

### Strategy engine (`strategy/`)
tyre, fuel, pit_window, undercut, overcut, traffic, weather, race_engineer — all original,
independently testable modules

### FastF1 reference integration (`reference/`)
Real client wrapping the actual FastF1 library (column schema verified against your uploaded
source), "complete package" comparison against real historical F1 laps, one API route

### Setup Engine (`setups/`)
`CircuitSetup` model with fields verified against the real `CarSetupData` UDP struct, pluggable
`SetupImporter` architecture (no scraping — modular source registration), fallback-aware
recommender (skill level → input device, transparently, never silent), 2 honestly-reasoned
seed setups (Monaco/Monza) with engineering rationale, not claimed lap-time-verified data

### AI Race Engineer (`engineer/`)
8 advisors (tyre, fuel, ERS, DRS, pit window, weather, flags/Safety Car/VSC, damage) composed
into one prioritized `list[Recommendation]` — **currently mid-upgrade to add confidence scores**
(see state section above)

### Radio Message Queue (`radio/`)
Prioritization, exact-duplicate suppression, per-category throttling (deliberately separate
mechanisms), wired to the real `VoiceService` for TTS-readiness — **currently broken by the
confidence rollout**, fix is the same one-line pattern as the advisors

### AI Driver Coach (`coaching/`)
Corner detection from telemetry signal alone (no track database — local speed minima +
steering corroboration), braking/throttle/steering-smoothness analysis, cross-lap corner
matching by apex-distance proximity, consistency scoring, tyre preservation advice, confidence
on every recommendation. Fully tested (30 tests) and reviewed for technical debt (see
`docs/` — known limitations documented honestly: sample-rate sensitivity, chicane
over-counting, fixed consistency threshold not track-length-normalized).
**Service/schema/API route layer not built yet** — pure domain logic only so far.

### Website (`apps/website/`)
All 6 pages, dark motorsport theme, signature animated telemetry hero panel. Build/lint/runtime
all verified with real screenshots (shared with you earlier).

### Desktop app (`apps/desktop/`)
All 6 pages, all 9 dashboard widgets, route-level code splitting (662KB → 246KB main bundle,
verified by rebuilding). Actually launched under `xvfb` and confirmed running. **Uses 100% mock
data — not wired to the real backend yet.**

---

## What's incomplete or not started

1. **Confidence rollout** (6 files) — finish first, see above. ~15 minutes of mechanical work.
2. **`undercut_advisor.py` / `overcut_advisor.py` / `push_conserve_advisor.py`** — planned,
   not built. `strategy/undercut.py` and `strategy/overcut.py` already exist and just need
   the same thin-wrapper treatment as the other 8 advisors.
3. **Session Analysis Engine (`session_analysis/`)** — directory exists, zero files written.
   Planned: lap/sector comparison, stint analysis, tyre/fuel trends, pace evolution, incident
   detection (via `Lap.is_valid` + reusing `coaching.corner_detection` for telemetry anomalies),
   personal bests, session scoring. Explicitly scoped to reuse `coaching.consistency_analysis`
   rather than a third re-implementation.
4. **Driver Coach service/schema/API route** — domain logic is done and tested; the DB-bridging
   service layer (pulling `TelemetryFrameRecord`/`Lap`/`TyreStint` into `coaching.TelemetrySample`)
   isn't built. Note: `TelemetryFrameRecord` has no persisted `lap_distance_m` — the plan is to
   derive it by integrating speed over time in the service layer (documented estimate, not a
   schema change), not to modify the existing model.
5. **No frontend for anything built in the last several sessions** — Setup Engine, AI Race
   Engineer, Radio Queue, Driver Coach, FastF1 comparison, and Session Analysis all currently
   have zero UI. The website/desktop app only reflect the project's earlier state.
6. **CI** (`.github/workflows/`) and **`scripts/`** — not started.
7. **Voice STT/TTS** — interfaces only, no real provider wired in.
8. **Font self-hosting** — flagged earlier (Google Fonts CDN isn't reachable from the dev
   sandbox that captured your screenshots; likely fine on a real machine, but self-hosting
   would remove the dependency entirely).
9. **Desktop app → real backend wiring** — replace the mock Zustand store with the real
   WebSocket/REST client.
10. **Circuit setup seed data** — only 2 example circuits (Monaco, Monza). Real coverage needs
    more circuits, ideally sourced via the `SetupImporter` architecture once a trusted source
    is identified — deliberately not scraped per your instruction.

## Recommended next order

1. Finish the confidence rollout (get back to 0 failures/errors before anything else)
2. Wire undercut/overcut/push-conserve into `engineer/advisor.py`
3. Build Session Analysis Engine
4. Build Driver Coach's service/schema/route layer
5. Start frontend for whichever backend capability matters most to you first
