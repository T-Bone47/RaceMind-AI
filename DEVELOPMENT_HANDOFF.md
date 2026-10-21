# RaceMind AI — V1 Development Handoff

This document is the authoritative baseline for the next development phase (Antigravity + Claude Opus workspace). It reflects the actual, verified state of the repository at handoff time — every number below comes from commands run against this exact checkout, not from earlier session summaries.

## 1. Project Overview

RaceMind AI is a production-grade AI-powered F1 race engineering assistant targeting Codemasters F1 25/26 (with parser support back to F1 15). It's a pnpm/Turborepo monorepo:

- **`apps/website`** — Next.js website
- **`apps/desktop`** — Electron desktop app
- **`backend/`** — Python/FastAPI backend (the focus of this handoff — everything below concerns `backend/` unless noted)
- **`packages/types`, `packages/shared`, `packages/ui`, `packages/config`** — shared TypeScript packages consumed by the two frontend apps

The backend provides: live UDP telemetry ingestion, a race strategy engine, an AI race engineer advisory system ("Ollie"), post-session coaching analysis, a voice interface (speech-to-text → intent routing → text-to-speech), and a setup reference library (mid-audit, see §12/§17).

## 2. Current Architecture

- **Language/runtime**: Python 3.12, `asyncio` throughout
- **Web framework**: FastAPI, routes under `api/routes/`, request/response schemas under `api/schemas/` (Pydantic v2, never expose ORM models directly)
- **Database**: PostgreSQL via SQLAlchemy 2.0 async ORM. Models in `database/models/`, one repository class per aggregate in `database/repositories/` (all inherit `BaseRepository[Model]`), all queries go through repositories — no raw session queries in services/routes
- **Service layer**: `services/*.py` sits between routes and repositories/domain packages; services are where `HTTPException` gets raised for domain-level errors (404/409/etc.)
- **Domain packages** (deliberately DB-agnostic, take plain dataclasses in/out): `strategy/`, `engineer/`, `coaching/`, `session_analysis/`, `radio/`, `voice/`
- **Dependency injection**: `api/dependencies.py` wires repos → services → routes via FastAPI's `Depends()`
- **Testing**: pytest + pytest-asyncio (`asyncio_mode = "auto"`), SQLite in-memory for DB tests, httpx `AsyncClient` for API integration tests
- **Type/lint**: mypy (`disallow_untyped_defs = true` for application code, relaxed for `tests.*`), ruff (`E, F, I, UP, B, SIM`)

A recurring architectural principle enforced throughout this codebase: **each concern has exactly one implementation, reused everywhere it's needed** — one `Recommendation` type (`engineer/models.py`), one radio queue (`radio/queue.py`), one `EngineerSessionState`, one `VoiceService`. New work plugs into these rather than creating parallel versions. This was verified concretely (via diff against a pristine copy of the repo, and via file-modification timestamps) at the end of every phase in this session.

## 3. Completed Milestones

1. **Race Strategy Engine** (`strategy/`) — pit window calculation, undercut/overcut/push-conserve simulation, tyre/fuel state modeling
2. **Engineer Advisors** (`engineer/`) — 10 advisor modules (fuel, tyre, ERS, DRS, flag, damage, weather, pit_window, undercut, overcut, push_conserve) + `EngineeringAdvisor` orchestrator
3. **Confidence rollout** — every `Recommendation` carries a `ConfidenceScore` (`common/confidence.py`)
4. **Session Analysis** (`session_analysis/`) — lap comparison, stint analysis, pace/fuel trend detection, incident detection, personal bests, session scoring; pure post-session domain logic, no DB coupling
5. **Driver Coach domain** (`coaching/`) — corner detection from telemetry alone (no track map), consistency scoring, tyre preservation advice
6. **Driver Coach service/API** (`services/coaching_service.py`, `api/routes/coaching.py`) — DB-backed, converts `Lap`/`TelemetryFrameRecord`/`TyreStint` into `coaching/`'s domain types; notably estimates `lap_distance_m` (not persisted in the DB) via trapezoidal integration of speed over time, documented as an estimate
7. **Voice provider layer** — `voice/base.py` + `voice/service.py` (pre-existing, never modified), `voice/config.py` + `voice/models.py` (new: provider selection settings)
8. **STT providers** (`voice/stt/`) — `FasterWhisperSTT` (local, VAD via faster-whisper's own bundled Silero-based `vad_filter`, not a separate `silero-vad` package), `OpenAISTT`
9. **TTS providers** (`voice/tts/`) — `ElevenLabsTTS`, `OpenAITTS`, `PiperTTS`
10. **Ollie Intent Parser** (`voice/intents/parser.py`) — keyword-based (not LLM-based, deliberately deterministic), 10 topic intents + 2 follow-up types (why/when)
11. **Ollie Intent Router** (`voice/intents/router.py`) — dispatches to one handler per intent, each handler a thin wrapper calling an existing `engineer/`/`strategy/`/`services/` module — no engineering calculation is duplicated anywhere in `voice/`
12. **Ollie Response Builder** (`voice/intents/response_builder.py` + `templates.py`) — speaks the top-priority `Recommendation.message` verbatim; templates only cover the case where an advisor legitimately found nothing to flag but a driver asked directly
13. **Conversation Context** (`voice/intents/context.py`) — bounded short-term memory (default last 3 exchanges), supports "why" (general, any category) and "when" (narrow, pit-window only) follow-ups
14. **Existing Radio integration** — `radio/queue.py` (dedup + priority + throttle) and `radio/delivery.py` (`deliver_next()`, dequeue + synthesize) were **reused, never modified**, across all of Phase 5
15. **Live Voice Audio Pipeline** (`voice/audio/` + `voice/pipeline.py`) — real `sounddevice`/`soundfile`-based mic capture and speaker playback, with two deliberately separate paths: driver-initiated conversation (always answers immediately, independent of the radio queue) and engineer-initiated radio (drains the existing queue via the existing `deliver_next()`). Priority-aware `Speaker.play()` lets a critical radio message interrupt driver conversation playback.

## 4. Current Directory Structure

```
RaceMind-AI/
├── apps/
│   ├── desktop/          Electron app (not audited this session)
│   └── website/          Next.js site (not audited this session)
├── packages/
│   ├── types/ shared/ ui/ config/    shared TS packages (not audited this session)
├── database/              top-level: schema.sql + migrations/ (separate from backend/database/ — see note below)
├── docs/
│   ├── ARCHITECTURE.md
│   └── TELEMETRY_SETUP.md
├── docker/
├── scripts/
├── .github/workflows/
└── backend/
    ├── ai/                Anthropic-backed AI Engineer chat/voice assistant glue
    ├── alembic/           DB migrations (SQLAlchemy-side)
    ├── api/               routes/, schemas/, websocket/, dependencies.py, main.py
    ├── auth/               JWT auth, password hashing
    ├── coaching/           Driver Coach domain logic
    ├── common/             confidence.py
    ├── config/             Settings (pydantic-settings)
    ├── database/           models/, repositories/, base.py, session.py
    ├── engineer/           10 advisor modules + advisor.py orchestrator + models.py
    ├── radio/              queue.py, delivery.py, models.py
    ├── reference/           reference data (circuit info etc.)
    ├── services/            service layer (session, strategy, coaching, auth, setup)
    ├── session_analysis/    post-session analysis domain logic
    ├── setups/              Setup Library — mid-audit, see §12/§17
    ├── strategy/            pit window, undercut, overcut, tyre, fuel
    ├── telemetry/           UDP listener + per-game-version parsers
    ├── tests/               all backend tests
    └── voice/
        ├── audio/           devices.py, microphone.py, speaker.py, stream.py
        ├── intents/         parser.py, router.py, context.py, response_builder.py,
        │                    templates.py, models.py, handlers/ (11 files)
        ├── stt/             faster_whisper.py, openai.py, base.py
        ├── tts/             elevenlabs.py, openai.py, piper.py, base.py
        ├── base.py service.py config.py models.py pipeline.py
```

**Note on the two `database` directories**: `backend/database/` (SQLAlchemy models/repositories, what the application code imports from) and the top-level `database/` (`schema.sql` + a `migrations/` folder containing only `.gitkeep`) are two different things. This wasn't investigated further this session — flagging it as a structural question for whoever owns migrations going forward, not something resolved here.

## 5. Database Architecture

- SQLAlchemy 2.0 async ORM, PostgreSQL (`asyncpg` driver)
- Every model uses `UUIDPrimaryKeyMixin` (client-side `uuid.uuid4()` default, so `.id` is known before flush) and `TimestampMixin` (`created_at`/`updated_at`, `server_default=func.now()`)
- Key models: `User`, `RaceSession`, `Lap`, `TelemetryFrameRecord`, `TyreStint`, `StrategyPlan`, `CircuitSetup`
- Repository pattern: `BaseRepository[ModelType: Base]` generic base (PEP 695 class-level generic syntax), one subclass per aggregate, each adding purpose-specific query methods (e.g. `LapRepository.list_for_session`, `TelemetryFrameRepository.list_for_lap`)
- Tests use `aiosqlite` in-memory, with `get_db` overridden in the FastAPI app for API-level integration tests

## 6. Strategy Architecture

`strategy/` — `pit_window.py` (`calculate()` → `PitWindow` with `.optimal_lap`), `undercut.py`, `overcut.py`, `tyre.py` (`TyreState`), `fuel.py` (`FuelState`), `race_engineer.py` (an older orchestrator still used directly by `services/strategy_service.py` for the persisted `StrategyPlan` flow — coexists with, and is distinct from, `engineer/advisor.py`'s real-time advisory flow).

## 7. Engineer Architecture

`engineer/models.py` — `EngineerSessionState` (the central "current race state" struct: tyre/fuel/ERS/DRS/track status/weather/damage/gaps/laps), `Recommendation` (category, priority, confidence, message, reasoning), `RecommendationCategory`, `RecommendationPriority` (INFO < LOW < MEDIUM < HIGH < CRITICAL, via `priority_rank()`).

`engineer/advisor.py` — `EngineeringAdvisor.analyze(state)` calls all 10 advisor modules and returns the combined, sorted `list[Recommendation]`. Each advisor is a plain module-level `analyze(...)` function taking only the state slice it needs (e.g. `fuel_advisor.analyze(fuel_state, laps_to_finish=...)`) — this exact calling convention is what every `voice/intents/handlers/*.py` module reuses, so no engineering logic exists in two places.

## 8. Session Analysis Architecture

`session_analysis/` — pure domain logic, no DB coupling (mirrors `coaching/`'s decoupling pattern). `analyze_session(*, laps, tyre_states_by_lap, fuel_states_by_lap, telemetry_by_lap) -> SessionReport` is the single orchestrating entry point, composing lap comparison, stint analysis, pace/fuel trends, incident detection, personal bests, and session scoring.

## 9. Driver Coach Architecture

Domain (`coaching/`): `DriverCoach.generate_report(*, laps, lap_times_ms, tyre_wear_snapshots) -> CoachingReport`; corner detection works from telemetry signal alone (speed dips + steering input), no track map.

Service (`services/coaching_service.py`): loads `Lap`/`TelemetryFrameRecord`/`TyreStint` for a session, converts to `coaching/`'s plain types, and — since `TelemetryFrameRecord` has no persisted `lap_distance_m` — estimates it via trapezoidal integration of speed over elapsed time (documented in the function's docstring as an estimate, exact for linear speed changes between samples).

API (`api/routes/coaching.py`, `api/schemas/coaching.py`): `GET /coaching/{session_id}/report`, 404 if session missing, 409 if no completed laps or no telemetry.

## 10. Voice/Ollie Architecture

Full pipeline, each stage backed by exactly one implementation:

```
Driver → Microphone (voice/audio/microphone.py, push-to-talk)
       → VoiceService.transcribe() (voice/service.py, pre-existing)
         → an STT provider (voice/stt/faster_whisper.py or openai.py)
       → OllieRouter.handle_utterance() (voice/intents/router.py)
         → parser.parse() → IntentType
         → one handler (voice/intents/handlers/*.py) → calls the real engineer/strategy/services module
         → response_builder.build_response() → OllieResponse (text + primary Recommendation + list to enqueue)
       → spoken immediately via VoiceService.speak() → Speaker.play() (voice/audio/speaker.py)
       → separately, response.to_enqueue feeds RadioMessageQueue.enqueue() (radio/queue.py, unmodified)
```

Separately, `VoicePipeline.deliver_next_radio_message()` drains the same queue via the existing, unmodified `radio/delivery.py:deliver_next()` and plays the result — this is the engineer-initiated path (proactive advisories), deliberately not auto-chained after the driver path, to avoid speaking the same `Recommendation` twice.

`Speaker.play(audio, priority)` is priority-aware: a message ranked above what's currently playing interrupts it (`stop()` then plays); anything ranked equal or lower is rejected outright — not queued, no second queue exists anywhere in `voice/`.

## 11. Radio Architecture

`radio/models.py` (`RadioMessage`, `SpeechPayload`), `radio/queue.py` (`RadioMessageQueue` — fingerprint-based dedup, priority + category throttling, CRITICAL never throttled), `radio/delivery.py` (`deliver_next(queue, voice_service)` — dequeue + synthesize). This package predates the voice work in this session and was **never modified** — confirmed via file-modification timestamps at the end of every phase that touched voice/.

## 12. Existing Setup Library Architecture

**Status: mid-audit, not modified.** `setups/` package:

- `setups/recommender.py` — `SetupRecommender.recommend(...)`: exact-match lookup via `CircuitSetupRepository.find_matches()`, with a transparent, deterministic fallback chain (try a different skill level, then a different input device) — never invents values, always returns a real stored `CircuitSetup` or raises `NoSetupAvailableError`. Its name suggests an "AI recommendation engine," but its actual behavior is closer to "smart search with graceful degradation" — this distinction matters for the next phase.
- `setups/importers/base.py` — `SetupImporter` Protocol + `SetupImportRecord` DTO + `ImporterRegistry`. This is the intended extension point for new setup sources (mirrors `telemetry/provider.py`'s shape deliberately).
- `setups/seed_data.py` — `SeedDataImporter`, RaceMind's own reasoned-baseline setups (Monaco, Monza), going through the same `SetupImporter` interface as any external source, explicitly documented as "not lap-time-verified."
- `database/models/circuit_setup.py` — `CircuitSetup` ORM model with individually-labeled physical fields (`front_wing`, `rear_wing`, `diff_on_throttle`, etc. — not combined/slash-separated), matching the real game's UDP `CarSetupData` struct.
- `database/repositories/circuit_setup_repository.py` — `find_matches()` (exact match only — the repository never guesses at "close enough"), `list_for_track()`, `list_by_source()`, `list_for_user()`.

## 13. Current Test Status

```
$ pytest --tb=short -q
........................................................................ [ 21%]
........................................................................ [ 43%]
........................................................................ [ 65%]
........................................................................ [ 86%]
............................................                             [100%]
332 passed in 32.90s

$ mypy .
Success: no issues found in 222 source files

$ ruff check .
All checks passed!
```

Coverage (`pytest --cov=. --cov-report=term`), full repository:

```
TOTAL    6340 statements, 467 missed, 93%
```

Notable per-module figures: `voice/intents/*` and `voice/audio/*` and `voice/pipeline.py` are at 98–100% (the two sub-100% lines are both genuinely unreachable defensive branches, documented in earlier session reports, not gaps). `voice/config.py` (0%) and `voice/models.py` (0%) are never directly exercised by a dedicated test — they're the `VoiceSettings`/provider-name-enum definitions from Phase 5 Step 1, functionally verified manually at the time but with no formal pytest coverage. The bulk of the 467 missed statements are in pre-existing code outside this session's scope (not individually audited here).

## 14. Current Dependency State

`requirements.txt`:
```
fastapi>=0.115,<1.0
uvicorn[standard]>=0.32,<1.0
pydantic>=2.9,<3.0
pydantic-settings>=2.6,<3.0
email-validator>=2.2,<3.0
sqlalchemy>=2.0.36,<2.1
asyncpg>=0.30,<0.31
alembic>=1.14,<2.0
pyjwt>=2.9,<3.0
bcrypt>=4.2,<5.0
python-multipart>=0.0.12
anthropic>=0.40,<1.0
fastf1>=3.8,<4.0

# Voice stack (Phase 5)
faster-whisper>=1.2,<2.0
openai>=2.53,<3.0
elevenlabs>=2.61,<3.0
piper-tts>=1.6,<2.0
sounddevice>=0.5,<0.6
soundfile>=0.14,<0.15
pydub>=0.25,<0.26
```

`requirements-dev.txt` adds: `pytest>=8.3,<9.0`, `pytest-asyncio>=0.24,<1.0`, `pytest-cov>=7.1,<8.0`, `httpx>=0.27,<1.0`, `aiosqlite>=0.20,<0.21`, `ruff>=0.7,<1.0`, `mypy>=1.13,<2.0`.

System-level: `sounddevice` requires PortAudio (`libportaudio2`/`portaudio19-dev` on Debian/Ubuntu; bundled in the Windows wheel).

## 15. Known Limitations

- `Speaker.play()` rejects (doesn't queue) a lower-or-equal-priority request while something is already playing — deliberate, to avoid a second internal queue, but means a low-priority driver answer could occasionally be silently dropped rather than delayed if timed exactly wrong against radio playback.
- No real-time streaming VAD for "manual trigger" recording mode — VAD only runs on the completed recording via faster-whisper's `vad_filter`, not live during capture.
- `NetworkFailureError` wraps `(TimeoutError, OSError)` broadly rather than per-provider-SDK exception types, trading precision for not coupling `voice/pipeline.py` to every provider's exact exception hierarchy.
- Coaching's "Turn N" mapping is `corner_detection`'s detection-order index, not an official track-map turn number — the honest option available, since no track map exists anywhere in this codebase.
- The "when" follow-up only resolves for pit-window/strategy context; other categories honestly answer "Unable to confirm" rather than fabricate a number.
- `voice/config.py`/`voice/models.py` have no dedicated tests (see §13).

## 16. Physical Hardware Testing Limitation

**No physical microphone or speaker has been verified, in this environment or by me.** The development sandbox used for this entire session has no audio hardware at all (`sounddevice.query_devices()` returns empty; confirmed directly, not assumed). Every audio-pipeline test either exercises that real absence (the documented "no device" error paths) or mocks `sounddevice.InputStream`/`OutputStream` with synthetic data. Three standalone smoke-test scripts (mic+speaker round-trip, full pipeline with a real STT/TTS provider, radio-path delivery) were prepared and handed to the user for local execution on their Windows machine with real hardware — as of this handoff, results from that local run have not been reported back. Phase 8 of the roadmap below exists specifically to close this gap; it should not be considered done until real hardware output is confirmed.

## 17. Known Setup Library / XLSX Mismatches

The Setup Library audit was in progress (Step 1: audit only, no code changes) when this handoff was requested. Findings so far, against `Matt212_Setups.xlsx` (4 sheets: `F1 26`, `F1 25`, `F1 25 Wet`, `F2 25`):

**Confirmed structural mismatches:**
- `SetupSkillLevel` (BEGINNER/INTERMEDIATE/ADVANCED/ESPORTS) exists in `CircuitSetup`/`SetupImportRecord` as a **required, non-nullable** field, but the XLSX has no skill-level concept at all — one setup per track, no variants.
- `engine_braking` is required (non-nullable, `default=0`) in both the ORM model and `SetupImportRecord`, but no column in any XLSX sheet provides it.
- `ballast` and `fuel_load` are similarly required-with-default (0, 0.0) but have no XLSX counterpart. Using the existing defaults would misrepresent "not provided" as "the real value is zero" — the spec's explicit rule against inventing/guessing values applies here.
- `GameTitle` (`telemetry/models.py`) has no F2 (Formula 2) concept at all, yet the source workbook has a dedicated `F2 25` sheet. This needs a decision: extend `GameTitle`, model F2 separately, or exclude it — not resolved in this handoff.
- `database/models/circuit_setup.py`'s fields are individually labeled (`front_wing: int`, `rear_wing: int`, ...), but the XLSX combines related values into single slash-separated cells per category (e.g. `Aerodynamics: "21 / 17"`). Splitting these requires an ordering assumption (front-before-rear) that is conventional in F1 setup sheets but not explicitly labeled in the source itself — worth stating plainly to whoever implements the importer, not silently assumed.

**Confirmed architectural alignment (reuse, don't rebuild):**
- `SetupSource.COMMUNITY_IMPORT` already exists as a distinct tag from `AI_GENERATED` — the right tag for this import, and evidence the architecture already separates "imported reference data" from "AI-generated setups" conceptually.
- `SetupImporter` (Protocol) + `SetupImportRecord` (DTO) + `ImporterRegistry` in `setups/importers/base.py` is the intended, already-built extension point for a new XLSX importer — no new architecture needed here.
- `SetupRecommender` is deterministic exact-match-with-transparent-fallback, not AI-generated advice — it should not be confused with (and doesn't need to be replaced by) a future AI Setup Engine.

**Additional findings from direct inspection of the XLSX** (not in the original issue list, found during the audit itself):
- Several video-link columns exist in the F1 26/F1 25 (dry) sheets — `Track Guide Link`, `Race Strategy 50%`, `Short Format`, `Raw Hotlap` — that the original feature spec didn't anticipate at all. The `F1 25 Wet` and `F2 25` sheets lack all four of these (only 8 columns vs. 11).
- `Race Strategy 50%` contains real strategy content (e.g. `"M - H (Pit around lap 12/13)"`) — genuine source data, not AI-generated, but its presence sits close to the spec's "this is NOT a strategy calculation system" boundary and is worth an explicit decision (include as reference data vs. exclude) rather than a silent default either way.
- Minor source data-quality issues: at least two rows have a missing slash in the Tyres column (e.g. F1 26 Las Vegas: `"24.7 / 24.7 22.5 / 22.5"`), one row has a stray character in a numeric field (F1 25 Netherlands Reverse: `"22c"` in the Suspension column), and one row is missing a negative sign where the pattern strongly implies one belongs (F2 25 Bahrain: `"-3.50 / 2.00 / ..."`, every other row has both values negative). None of these were corrected — flagging them for the next team's explicit decision, per "do not invent/correct values."
- The `Track Guide Link` column is inconsistently populated — sometimes a video title string, sometimes a raw URL, in at least one case a raw URL landing in a different column than its row-mates.
- Nothing in the XLSX self-labels as "controller-only" — that framing comes from the person's own description of the source, not from a field within the spreadsheet itself. Worth confirming before assuming the whole dataset is controller-exclusive.

**Do not invent missing setup values. Do not scrape external setup websites.** Both stated explicitly in the original feature spec and worth restating here.

## 18. Recommended Next Development Sequence

```
PHASE 5 — Setup Library
  XLSX audit → field mapping → model compatibility → importer → validation → database → API → tests

PHASE 6 — Frontend Integration
  Existing Magic Patterns frontend → RaceMind backend APIs → real data →
  real authentication/session flow if applicable → loading/error/empty states →
  end-to-end functionality
  IMPORTANT: the Magic Patterns frontend is an already-approved design — do not redesign it.

PHASE 7 — End-to-End Testing
  Frontend → API → backend → database → strategy/coaching/setup/voice

PHASE 8 — Real Windows Voice Validation
  Microphone → STT → Ollie → TTS → speaker
  (see §16 — this has not happened yet; smoke-test scripts are ready and waiting on local results)

PHASE 9 — Production Audit
  Security, performance, database, API, secrets, error handling, logging,
  voice provider failures, configuration, deployment readiness

PHASE 10 — Deployment / V1 Release
  Staging → smoke tests → beta testing → production
```

**Architectural rule for all subsequent phases**: do not redesign core RaceMind architecture without a concrete, demonstrated reason. Reuse existing validated systems (`Recommendation`, `RadioMessageQueue`, `EngineerSessionState`, `VoiceService`, `BaseRepository`, `SetupImporter`) — no parallel strategy engine, Recommendation model, radio queue, voice architecture, or database abstraction.
