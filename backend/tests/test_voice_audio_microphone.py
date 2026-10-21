from __future__ import annotations

import io
from unittest.mock import MagicMock

import numpy as np
import pytest
import sounddevice as sd
import soundfile as sf

from voice.audio.microphone import Microphone
from voice.audio.stream import DeviceNotFoundError


def _fake_stream_cls_capturing_callback(captured: dict):
    """Returns a fake InputStream class that stashes the callback it
    was given so a test can invoke it manually, simulating real audio
    arriving."""

    def _constructor(*, device, samplerate, channels, callback):
        captured["callback"] = callback
        return MagicMock()

    return _constructor


def test_microphone_starts_and_stops_cleanly(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "InputStream", _fake_stream_cls_capturing_callback(captured))

    mic = Microphone()
    assert not mic.is_recording
    mic.start()
    assert mic.is_recording
    wav_bytes = mic.stop()
    assert not mic.is_recording
    assert wav_bytes[:4] == b"RIFF"


def test_microphone_captures_real_audio_through_the_callback(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "InputStream", _fake_stream_cls_capturing_callback(captured))

    mic = Microphone(samplerate=16000, channels=1)
    mic.start()

    # Simulate two blocks of audio arriving via the stream's callback.
    chunk_a = np.full((160, 1), 0.1, dtype=np.float32)
    chunk_b = np.full((160, 1), -0.1, dtype=np.float32)
    captured["callback"](chunk_a, 160, None, None)
    captured["callback"](chunk_b, 160, None, None)

    wav_bytes = mic.stop()
    data, samplerate = sf.read(io.BytesIO(wav_bytes))
    assert samplerate == 16000
    assert len(data) == 320  # both chunks concatenated


def test_microphone_stop_with_no_captured_audio_returns_valid_empty_wav(monkeypatch):
    captured: dict = {}
    monkeypatch.setattr(sd, "InputStream", _fake_stream_cls_capturing_callback(captured))

    mic = Microphone()
    mic.start()
    wav_bytes = mic.stop()  # released immediately, callback never fired

    data, _ = sf.read(io.BytesIO(wav_bytes))
    assert len(data) == 0


def test_microphone_stop_without_ever_starting_does_not_crash():
    mic = Microphone()
    wav_bytes = mic.stop()
    assert wav_bytes[:4] == b"RIFF"


def test_microphone_start_while_already_recording_is_a_noop(monkeypatch):
    construct_count = 0

    def counting_constructor(*, device, samplerate, channels, callback):
        nonlocal construct_count
        construct_count += 1
        return MagicMock()

    monkeypatch.setattr(sd, "InputStream", counting_constructor)

    mic = Microphone()
    mic.start()
    mic.start()  # a second press before release
    assert construct_count == 1


def test_microphone_with_no_hardware_raises_device_not_found(monkeypatch):
    def raise_error(*args, **kwargs):
        raise sd.PortAudioError("No devices found")
    monkeypatch.setattr(sd, "InputStream", raise_error)
    mic = Microphone()
    with pytest.raises(DeviceNotFoundError):
        mic.start()
