from __future__ import annotations

import io
import uuid
from unittest.mock import MagicMock

import numpy as np
import pytest
import sounddevice as sd
import soundfile as sf

from common.confidence import fixed
from database.models.enums import TyreCompound
from engineer import tyre_advisor
from engineer.models import (
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
    TyreState,
)
from radio.queue import RadioMessageQueue
from tests.engineer_state_fixtures import build_state
from voice.audio.microphone import Microphone
from voice.audio.speaker import Speaker
from voice.audio.stream import NetworkFailureError, NoSpeechDetectedError, RecordingTimeoutError
from voice.base import ProviderNotConfiguredError, SpeechToTextProvider, TextToSpeechProvider
from voice.intents.context import ConversationContext
from voice.intents.models import HandlerContext
from voice.intents.router import OllieRouter
from voice.pipeline import VoicePipeline
from voice.service import VoiceService


def _wav_bytes(duration_samples: int = 100, samplerate: int = 16000) -> bytes:
    data = np.full((duration_samples, 1), 0.2, dtype=np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, data, samplerate=samplerate, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


class _FakeSTT(SpeechToTextProvider):
    def __init__(self, text: str = "Fuel?") -> None:
        self.text = text
        self.received_audio: list[bytes] = []
        self.raise_error: Exception | None = None

    async def transcribe(self, audio_bytes: bytes) -> str:
        self.received_audio.append(audio_bytes)
        if self.raise_error is not None:
            raise self.raise_error
        return self.text


class _FakeTTS(TextToSpeechProvider):
    def __init__(self) -> None:
        self.synthesized_texts: list[str] = []
        self.raise_error: Exception | None = None

    async def synthesize(self, text: str) -> bytes:
        self.synthesized_texts.append(text)
        if self.raise_error is not None:
            raise self.raise_error
        return _wav_bytes()


def _fake_input_stream_cls(captured: dict):
    def _constructor(*, device, samplerate, channels, callback):
        captured["input_callback"] = callback
        return MagicMock()

    return _constructor


def _fake_output_stream_cls(captured: dict):
    def _constructor(*, device, samplerate, channels, callback, finished_callback):
        stream = MagicMock()
        captured.setdefault("output_streams", []).append(stream)
        captured["output_callback"] = callback
        captured["output_finished_callback"] = finished_callback
        return stream

    return _constructor


@pytest.fixture
def audio_hardware(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "InputStream", _fake_input_stream_cls(captured))
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))
    return captured


def _build_pipeline(*, stt=None, tts=None):
    microphone = Microphone()
    speaker = Speaker()
    voice_service = VoiceService(stt=stt, tts=tts)
    radio_queue = RadioMessageQueue()
    router = OllieRouter(radio_queue, context=ConversationContext())
    pipeline = VoicePipeline(microphone, speaker, voice_service, router, radio_queue)
    return pipeline, speaker, radio_queue


def _ctx(state=None) -> HandlerContext:
    return HandlerContext(session_id=uuid.uuid4(), state=state or build_state(), coaching_service=None)


# --- Driver-initiated conversation path ---


async def test_full_conversation_flow_transcribes_routes_and_speaks(audio_hardware):
    stt = _FakeSTT(text="Fuel?")
    tts = _FakeTTS()
    pipeline, speaker, _ = _build_pipeline(stt=stt, tts=tts)

    pipeline.start_conversation()
    audio_hardware["input_callback"](np.full((160, 1), 0.1, dtype=np.float32), 160, None, None)
    response = await pipeline.stop_conversation(_ctx())

    assert response.text != ""
    assert len(stt.received_audio) == 1
    assert tts.synthesized_texts == [response.text]
    assert speaker.is_playing


async def test_conversation_always_answers_even_when_nothing_enqueued(audio_hardware):
    # TelemetryIntent enqueues nothing at all - the driver still needs
    # a spoken reply.
    stt = _FakeSTT(text="Gap ahead?")
    tts = _FakeTTS()
    pipeline, speaker, radio_queue = _build_pipeline(stt=stt, tts=tts)

    pipeline.start_conversation()
    response = await pipeline.stop_conversation(_ctx(build_state(gap_to_car_ahead_s=1.8)))

    assert "Gap ahead" in response.text
    assert tts.synthesized_texts == [response.text]
    assert speaker.is_playing
    assert radio_queue.pending() == []


async def test_no_speech_detected_when_transcription_is_empty(audio_hardware):
    stt = _FakeSTT(text="   ")
    pipeline, _, _ = _build_pipeline(stt=stt, tts=_FakeTTS())

    pipeline.start_conversation()
    with pytest.raises(NoSpeechDetectedError):
        await pipeline.stop_conversation(_ctx())


async def test_recording_timeout_when_held_too_long(audio_hardware):
    pipeline, _, _ = _build_pipeline(stt=_FakeSTT(), tts=_FakeTTS())
    pipeline.start_conversation()
    pipeline._recording_started_at -= 100.0  # simulate the button having been held a long time

    with pytest.raises(RecordingTimeoutError):
        await pipeline.stop_conversation(_ctx(), max_duration_s=30.0)


async def test_stop_without_start_reports_no_speech_rather_than_crashing():
    # Without start(), microphone.stop() produces an empty/silent WAV -
    # a real STT provider would return empty text for that, which is
    # what this fake needs to do too for the test's premise to hold.
    pipeline, _, _ = _build_pipeline(stt=_FakeSTT(text=""), tts=_FakeTTS())
    with pytest.raises(NoSpeechDetectedError):
        await pipeline.stop_conversation(_ctx())


async def test_text_only_mode_when_no_tts_configured(audio_hardware):
    pipeline, speaker, _ = _build_pipeline(stt=_FakeSTT(text="Fuel?"), tts=None)
    pipeline.start_conversation()
    response = await pipeline.stop_conversation(_ctx())

    assert response.text != ""
    assert not speaker.is_playing  # nothing to play - no TTS configured, not an error


async def test_provider_not_configured_propagates_when_no_stt(audio_hardware):
    pipeline, _, _ = _build_pipeline(stt=None, tts=_FakeTTS())
    pipeline.start_conversation()
    with pytest.raises(ProviderNotConfiguredError):
        await pipeline.stop_conversation(_ctx())


async def test_network_failure_during_transcription_is_wrapped(audio_hardware):
    stt = _FakeSTT()
    stt.raise_error = ConnectionError("dns lookup failed")
    pipeline, _, _ = _build_pipeline(stt=stt, tts=_FakeTTS())
    pipeline.start_conversation()

    with pytest.raises(NetworkFailureError):
        await pipeline.stop_conversation(_ctx())


async def test_network_failure_during_synthesis_is_wrapped(audio_hardware):
    tts = _FakeTTS()
    tts.raise_error = TimeoutError("request timed out")
    pipeline, _, _ = _build_pipeline(stt=_FakeSTT(text="Fuel?"), tts=tts)
    pipeline.start_conversation()

    with pytest.raises(NetworkFailureError):
        await pipeline.stop_conversation(_ctx())


# --- Engineer-initiated radio path ---


async def test_deliver_next_radio_message_speaks_from_the_existing_queue(audio_hardware):
    tts = _FakeTTS()
    pipeline, speaker, radio_queue = _build_pipeline(stt=_FakeSTT(), tts=tts)

    tyre_state = TyreState(compound=TyreCompound.SOFT, age_laps=25, wear_pct=92.0)
    recommendations = tyre_advisor.analyze(tyre_state)
    radio_queue.enqueue(recommendations)

    delivered = await pipeline.deliver_next_radio_message()

    assert delivered is True
    assert speaker.is_playing
    assert tts.synthesized_texts  # the real radio.delivery synthesized real text, not a placeholder


async def test_deliver_next_radio_message_returns_false_when_queue_is_empty(audio_hardware):
    pipeline, speaker, _ = _build_pipeline(stt=_FakeSTT(), tts=_FakeTTS())
    delivered = await pipeline.deliver_next_radio_message()
    assert delivered is False
    assert not speaker.is_playing


# --- Interruption interaction between the two paths ---


async def test_critical_radio_message_interrupts_an_ongoing_driver_conversation(audio_hardware):
    # Driver conversation is speaking (LOW priority fallback answer),
    # then a CRITICAL radio message arrives - it should interrupt.
    stt = _FakeSTT(text="What's the meaning of life?")  # -> UnknownIntent -> LOW priority fallback
    tts = _FakeTTS()
    pipeline, speaker, radio_queue = _build_pipeline(stt=stt, tts=tts)

    pipeline.start_conversation()
    await pipeline.stop_conversation(_ctx())
    assert speaker.is_playing  # the LOW priority fallback is now "playing"
    first_stream = audio_hardware["output_streams"][0]

    critical_rec = Recommendation(
        category=RecommendationCategory.SAFETY_CAR,
        priority=RecommendationPriority.CRITICAL,
        confidence=fixed(0.99, "flag data"),
        message="Safety car deployed.",
        reasoning="Race control confirmed.",
    )
    radio_queue.enqueue([critical_rec])
    delivered = await pipeline.deliver_next_radio_message()

    assert delivered is True
    first_stream.stop.assert_called_once()  # the driver conversation's playback was interrupted
    assert speaker.is_playing  # now playing the critical message instead


async def test_driver_conversation_cannot_interrupt_an_already_playing_critical_message(audio_hardware):
    # A critical radio message is already playing - a driver's
    # low-priority follow-up should not interrupt it.
    tts = _FakeTTS()
    pipeline, speaker, radio_queue = _build_pipeline(stt=_FakeSTT(text="What's the meaning of life?"), tts=tts)

    critical_rec = Recommendation(
        category=RecommendationCategory.SAFETY_CAR,
        priority=RecommendationPriority.CRITICAL,
        confidence=fixed(0.99, "flag data"),
        message="Safety car deployed.",
        reasoning="Race control confirmed.",
    )
    radio_queue.enqueue([critical_rec])
    await pipeline.deliver_next_radio_message()
    assert speaker.is_playing
    first_stream = audio_hardware["output_streams"][0]

    pipeline.start_conversation()
    response = await pipeline.stop_conversation(_ctx())

    # The driver still gets a transcribed, routed answer - the
    # question isn't silently dropped - but it did not interrupt the
    # critical message currently on air.
    assert response.text != ""
    first_stream.stop.assert_not_called()


# --- Radio queue interaction: no double-speaking ---


async def test_driver_conversation_enqueues_via_router_without_double_speaking(audio_hardware):
    # A strategy question produces a primary Recommendation that DOES
    # get enqueued by the router (for dedup/throttle bookkeeping and
    # any lower-priority siblings) - it should be spoken exactly once
    # by the immediate-answer path, not again if the queue were drained
    # right after.
    stt = _FakeSTT(text="Should I pit?")
    tts = _FakeTTS()
    pipeline, speaker, radio_queue = _build_pipeline(stt=stt, tts=tts)

    pipeline.start_conversation()
    response = await pipeline.stop_conversation(_ctx())

    assert len(tts.synthesized_texts) == 1  # spoken exactly once
    assert response.primary is not None
    assert len(radio_queue.pending()) >= 1  # and it's genuinely sitting in the queue too
