"""Connects the existing voice intelligence layer to real microphone
input and speaker output.

Two distinct, deliberately separate paths:

- Driver-initiated conversation: microphone -> STT -> OllieRouter ->
  the router's own immediate response text -> TTS -> speaker. This
  path always answers the driver's question, regardless of whether
  anything was enqueued onto the radio queue along the way - several
  intents (TelemetryIntent, SessionIntent, CoachingIntent,
  UnknownIntent, follow-ups) enqueue nothing at all, so a path that
  only spoke from the queue would leave those questions unanswered.
- Engineer-initiated radio: the existing RadioMessageQueue ->
  radio.delivery.deliver_next() (unchanged, reused as-is) -> speaker.
  This is for whatever future trigger decides to surface a proactive
  advisory; it's not called automatically from the driver path, to
  avoid speaking the same Recommendation twice (the router already
  enqueues it once for dedup/throttle bookkeeping and for lower-
  priority findings a handler didn't select as primary).

Both paths share the same VoiceService (STT/TTS providers, voice/
service.py) and the same Speaker (voice/audio/speaker.py), whose
priority-aware play() already lets a critical radio message interrupt
an ongoing driver conversation - see that module for the mechanism;
this file doesn't reimplement interruption logic, it just makes sure
both paths pass a real priority into the one place that has it.
"""

from __future__ import annotations

import time

from engineer.models import RecommendationPriority
from radio.delivery import deliver_next
from radio.queue import RadioMessageQueue
from voice.audio.microphone import Microphone
from voice.audio.speaker import Speaker
from voice.audio.stream import NetworkFailureError, NoSpeechDetectedError, RecordingTimeoutError
from voice.intents.models import HandlerContext, OllieResponse
from voice.intents.router import OllieRouter
from voice.service import VoiceService

DEFAULT_MAX_RECORDING_S = 30.0
# Priority for a spoken reply with no underlying Recommendation - a
# template fallback, a follow-up answer, or a raw telemetry/session
# fact. None of these are urgent engineering directives, so they use
# the lowest tier rather than being able to interrupt anything.
_FALLBACK_SPEECH_PRIORITY = RecommendationPriority.LOW


class VoicePipeline:
    def __init__(
        self,
        microphone: Microphone,
        speaker: Speaker,
        voice_service: VoiceService,
        router: OllieRouter,
        radio_queue: RadioMessageQueue,
    ) -> None:
        self._microphone = microphone
        self._speaker = speaker
        self._voice_service = voice_service
        self._router = router
        self._radio_queue = radio_queue
        self._recording_started_at: float | None = None

    # --- Driver-initiated conversation ---

    def start_conversation(self) -> None:
        """Push-to-talk press, or any manual trigger's start."""
        self._microphone.start()
        self._recording_started_at = time.monotonic()

    async def stop_conversation(
        self, ctx: HandlerContext, *, max_duration_s: float = DEFAULT_MAX_RECORDING_S
    ) -> OllieResponse:
        """Push-to-talk release, or a manual trigger's end - the full
        driver-initiated path. Always answers the driver directly;
        never waits on or depends on the radio queue."""
        audio_bytes = self._microphone.stop()
        elapsed = time.monotonic() - self._recording_started_at if self._recording_started_at is not None else 0.0
        self._recording_started_at = None
        if elapsed > max_duration_s:
            raise RecordingTimeoutError(f"Recording held for {elapsed:.1f}s, exceeding the {max_duration_s}s limit")

        text = await self._transcribe(audio_bytes)
        if not text.strip():
            raise NoSpeechDetectedError("No speech detected in the recording")

        response = await self._router.handle_utterance(text, ctx)
        await self._speak_immediately(response)
        return response

    async def _speak_immediately(self, response: OllieResponse) -> None:
        audio = await self._synthesize(response.text)
        if audio is None:
            return  # no TTS configured - text-only mode, not an error
        priority = response.primary.priority if response.primary is not None else _FALLBACK_SPEECH_PRIORITY
        self._speaker.play(audio, priority=priority)

    # --- Engineer-initiated radio ---

    async def deliver_next_radio_message(self) -> bool:
        """Drains one message from the existing radio queue via the
        existing radio.delivery.deliver_next (dequeue + synthesize,
        unchanged) and plays it. Returns whether something was
        delivered. Deliberately not called automatically from
        stop_conversation - see this module's docstring."""
        result = await deliver_next(self._radio_queue, self._voice_service)
        if result is None or result.audio is None:
            return False
        self._speaker.play(result.audio, priority=result.message.priority)
        return True

    # --- Shared STT/TTS helpers, used by both paths above ---

    async def _transcribe(self, audio_bytes: bytes) -> str:
        try:
            return await self._voice_service.transcribe(audio_bytes)
        except (TimeoutError, OSError) as exc:
            raise NetworkFailureError(f"Speech-to-text request failed: {exc}") from exc

    async def _synthesize(self, text: str) -> bytes | None:
        if not self._voice_service.can_speak:
            return None
        try:
            return await self._voice_service.speak(text)
        except (TimeoutError, OSError) as exc:
            raise NetworkFailureError(f"Text-to-speech request failed: {exc}") from exc
