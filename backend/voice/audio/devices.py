"""Audio input/output device enumeration and resolution - wraps
sounddevice.query_devices(). Returns an empty list rather than raising
when there's no audio hardware at all, since that's a normal,
expected deployment state (e.g. a headless server) rather than a
startup failure - callers decide whether "no devices" is an error for
their situation.
"""

from __future__ import annotations

from dataclasses import dataclass

import sounddevice as sd


@dataclass(frozen=True)
class DeviceInfo:
    index: int
    name: str
    max_input_channels: int
    max_output_channels: int
    default_samplerate: float


def list_input_devices() -> list[DeviceInfo]:
    return [d for d in _list_devices() if d.max_input_channels > 0]


def list_output_devices() -> list[DeviceInfo]:
    return [d for d in _list_devices() if d.max_output_channels > 0]


def resolve_input_device(name_or_index: str | int | None) -> int | None:
    """None resolves to the first available input device. A str is
    matched as a case-insensitive substring of the device name. An int
    is returned as-is if it's a genuinely present input device index."""
    return _resolve_device(name_or_index, list_input_devices())


def resolve_output_device(name_or_index: str | int | None) -> int | None:
    return _resolve_device(name_or_index, list_output_devices())


def _list_devices() -> list[DeviceInfo]:
    try:
        raw_devices = sd.query_devices()
    except sd.PortAudioError:
        return []
    return [
        DeviceInfo(
            index=d["index"],
            name=d["name"],
            max_input_channels=d["max_input_channels"],
            max_output_channels=d["max_output_channels"],
            default_samplerate=d["default_samplerate"],
        )
        for d in raw_devices
    ]


def _resolve_device(name_or_index: str | int | None, candidates: list[DeviceInfo]) -> int | None:
    if name_or_index is None:
        return candidates[0].index if candidates else None
    if isinstance(name_or_index, int):
        return name_or_index if any(d.index == name_or_index for d in candidates) else None
    matches = [d for d in candidates if name_or_index.lower() in d.name.lower()]
    return matches[0].index if matches else None
