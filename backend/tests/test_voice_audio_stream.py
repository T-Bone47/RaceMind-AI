from __future__ import annotations

from unittest.mock import MagicMock

import pytest
import sounddevice as sd

from voice.audio.stream import (
    DeviceNotFoundError,
    DevicePermissionError,
    open_input_stream,
    open_output_stream,
)


def test_open_input_stream_with_no_hardware_raises_device_not_found(monkeypatch):
    def raise_error(*args, **kwargs):
        raise sd.PortAudioError("No devices found")
    monkeypatch.setattr(sd, "InputStream", raise_error)
    with pytest.raises(DeviceNotFoundError):
        open_input_stream(device=None, samplerate=16000, channels=1, callback=lambda *a: None)


def test_open_output_stream_with_no_hardware_raises_device_not_found(monkeypatch):
    def raise_error(*args, **kwargs):
        raise sd.PortAudioError("No devices found")
    monkeypatch.setattr(sd, "OutputStream", raise_error)
    with pytest.raises(DeviceNotFoundError):
        open_output_stream(device=None, samplerate=16000, channels=1, callback=lambda *a: None)


def test_permission_error_is_translated_to_device_permission_error(monkeypatch):
    def raise_permission_error(*args, **kwargs):
        raise PermissionError("denied")

    monkeypatch.setattr(sd, "InputStream", raise_permission_error)
    with pytest.raises(DevicePermissionError):
        open_input_stream(device=0, samplerate=16000, channels=1, callback=lambda *a: None)


def test_portaudio_error_is_translated_to_device_not_found(monkeypatch):
    def raise_portaudio_error(*args, **kwargs):
        raise sd.PortAudioError("no such device")

    monkeypatch.setattr(sd, "InputStream", raise_portaudio_error)
    with pytest.raises(DeviceNotFoundError):
        open_input_stream(device=99, samplerate=16000, channels=1, callback=lambda *a: None)


def test_successfully_opened_stream_is_started(monkeypatch):
    fake_stream = MagicMock()
    monkeypatch.setattr(sd, "InputStream", MagicMock(return_value=fake_stream))
    stream = open_input_stream(device=0, samplerate=16000, channels=1, callback=lambda *a: None)
    assert stream is fake_stream
    fake_stream.start.assert_called_once()
