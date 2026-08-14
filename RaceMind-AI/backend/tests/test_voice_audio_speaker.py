from __future__ import annotations

import io
from unittest.mock import MagicMock

import numpy as np
import pytest
import sounddevice as sd
import soundfile as sf

from engineer.models import RecommendationPriority
from voice.audio.speaker import Speaker
from voice.audio.stream import DeviceNotFoundError


def _wav_bytes(duration_samples: int = 100, samplerate: int = 16000) -> bytes:
    data = np.full((duration_samples, 1), 0.2, dtype=np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, data, samplerate=samplerate, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


def _fake_output_stream_cls(captured: dict):
    def _constructor(*, device, samplerate, channels, callback, finished_callback):
        captured["callback"] = callback
        captured["finished_callback"] = finished_callback
        return MagicMock()

    return _constructor


def test_speaker_plays_when_idle(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))

    speaker = Speaker()
    assert not speaker.is_playing
    started = speaker.play(_wav_bytes(), priority=RecommendationPriority.MEDIUM)
    assert started is True
    assert speaker.is_playing


def test_speaker_rejects_lower_priority_while_playing(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))

    speaker = Speaker()
    speaker.play(_wav_bytes(), priority=RecommendationPriority.HIGH)
    started = speaker.play(_wav_bytes(), priority=RecommendationPriority.LOW)

    assert started is False
    assert speaker.is_playing  # the original HIGH playback is untouched


def test_speaker_rejects_equal_priority_while_playing(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))

    speaker = Speaker()
    speaker.play(_wav_bytes(), priority=RecommendationPriority.MEDIUM)
    started = speaker.play(_wav_bytes(), priority=RecommendationPriority.MEDIUM)

    assert started is False


def test_speaker_interrupts_lower_priority_playback(monkeypatch):
    streams_created = []

    def constructor(*, device, samplerate, channels, callback, finished_callback):
        stream = MagicMock()
        streams_created.append(stream)
        return stream

    monkeypatch.setattr(sd, "OutputStream", constructor)

    speaker = Speaker()
    speaker.play(_wav_bytes(), priority=RecommendationPriority.LOW)
    first_stream = streams_created[0]

    started = speaker.play(_wav_bytes(), priority=RecommendationPriority.CRITICAL)

    assert started is True
    first_stream.stop.assert_called_once()
    first_stream.close.assert_called_once()
    assert len(streams_created) == 2  # the interrupting playback opened its own new stream
    assert speaker.is_playing


def test_speaker_stop_halts_playback_and_clears_state(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))

    speaker = Speaker()
    speaker.play(_wav_bytes(), priority=RecommendationPriority.HIGH)
    speaker.stop()

    assert not speaker.is_playing
    # With nothing playing anymore, even a LOW priority message should
    # now be accepted rather than rejected.
    started = speaker.play(_wav_bytes(), priority=RecommendationPriority.LOW)
    assert started is True


def test_speaker_finished_callback_clears_state_after_natural_completion(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))

    speaker = Speaker()
    speaker.play(_wav_bytes(), priority=RecommendationPriority.HIGH)
    assert speaker.is_playing

    captured["finished_callback"]()  # simulate the stream finishing on its own

    assert not speaker.is_playing
    # Now that playback finished naturally, a LOW priority message
    # should be accepted, not rejected against stale state.
    started = speaker.play(_wav_bytes(), priority=RecommendationPriority.LOW)
    assert started is True


def test_speaker_playback_callback_feeds_correct_samples_and_stops_when_exhausted(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "OutputStream", _fake_output_stream_cls(captured))

    speaker = Speaker()
    speaker.play(_wav_bytes(duration_samples=10), priority=RecommendationPriority.MEDIUM)

    # First block: 6 of the 10 samples available.
    outdata = np.zeros((6, 1), dtype=np.float32)
    captured["callback"](outdata, 6, None, None)
    assert not np.all(outdata == 0)  # real audio was written, not silence

    # Second block: only 4 samples remain, requesting 6 - should
    # zero-pad the tail rather than crash or wrap around.
    outdata2 = np.zeros((6, 1), dtype=np.float32)
    captured["callback"](outdata2, 6, None, None)
    assert np.all(outdata2[4:] == 0)

    # Third block: fully exhausted now - should signal completion.
    outdata3 = np.zeros((6, 1), dtype=np.float32)
    with pytest.raises(sd.CallbackStop):
        captured["callback"](outdata3, 6, None, None)


def test_speaker_with_no_hardware_raises_device_not_found(monkeypatch):
    def raise_error(*args, **kwargs):
        raise sd.PortAudioError("No devices found")
    monkeypatch.setattr(sd, "OutputStream", raise_error)
    speaker = Speaker()
    with pytest.raises(DeviceNotFoundError):
        speaker.play(_wav_bytes(), priority=RecommendationPriority.HIGH)
