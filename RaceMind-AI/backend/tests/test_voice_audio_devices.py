from __future__ import annotations

import sounddevice as sd

from voice.audio.devices import (
    list_input_devices,
    list_output_devices,
    resolve_input_device,
    resolve_output_device,
)

_FAKE_DEVICES = [
    {
        "index": 0,
        "name": "Built-in Microphone",
        "max_input_channels": 2,
        "max_output_channels": 0,
        "default_samplerate": 44100.0,
    },
    {
        "index": 1,
        "name": "Built-in Speakers",
        "max_input_channels": 0,
        "max_output_channels": 2,
        "default_samplerate": 44100.0,
    },
    {
        "index": 2,
        "name": "Race Headset",
        "max_input_channels": 1,
        "max_output_channels": 2,
        "default_samplerate": 48000.0,
    },
]


def test_no_hardware_returns_empty_lists_not_an_error(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: [])
    assert list_input_devices() == []
    assert list_output_devices() == []


def test_list_input_devices_filters_to_devices_with_input_channels(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    names = [d.name for d in list_input_devices()]
    assert names == ["Built-in Microphone", "Race Headset"]


def test_list_output_devices_filters_to_devices_with_output_channels(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    names = [d.name for d in list_output_devices()]
    assert names == ["Built-in Speakers", "Race Headset"]


def test_resolve_none_picks_the_first_available_device(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    assert resolve_input_device(None) == 0
    assert resolve_output_device(None) == 1


def test_resolve_by_case_insensitive_name_substring(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    assert resolve_input_device("race headset") == 2
    assert resolve_output_device("HEADSET") == 2


def test_resolve_by_unmatched_name_returns_none(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    assert resolve_input_device("nonexistent device") is None


def test_resolve_by_valid_index_returns_that_index(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    assert resolve_input_device(2) == 2


def test_resolve_by_invalid_index_returns_none(monkeypatch):
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    assert resolve_input_device(99) is None


def test_resolve_output_by_index_that_has_no_output_channels_returns_none(monkeypatch):
    # Device 0 exists but has zero output channels - it's a valid
    # device index in general, but not a valid *output* device.
    monkeypatch.setattr(sd, "query_devices", lambda: _FAKE_DEVICES)
    assert resolve_output_device(0) is None


def test_portaudio_error_during_listing_is_treated_as_no_devices(monkeypatch):
    def raise_error():
        raise sd.PortAudioError("no backend")

    monkeypatch.setattr(sd, "query_devices", raise_error)
    assert list_input_devices() == []
