"""Shared audio-pipeline exceptions and low-level sounddevice stream
helpers used by both microphone.py and speaker.py, so device-error
translation lives in one place rather than being duplicated on the
input and output sides.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import sounddevice as sd


class AudioPipelineError(Exception):
    """Base for every error voice/audio/ and voice/pipeline.py raise."""


class DeviceNotFoundError(AudioPipelineError):
    """The requested (or default) input/output device doesn't exist, or
    no audio hardware is available at all."""


class DevicePermissionError(AudioPipelineError):
    """The OS denied access to the audio device."""


class NoSpeechDetectedError(AudioPipelineError):
    """Recording completed but transcription came back empty - either
    VAD found nothing to send to the STT provider, or the provider
    heard only silence or noise."""


class RecordingTimeoutError(AudioPipelineError):
    """Push-to-talk recording ran past its configured maximum duration
    without being stopped."""


class NetworkFailureError(AudioPipelineError):
    """A cloud STT/TTS provider call failed due to a network problem."""


def open_input_stream(
    *, device: int | str | None, samplerate: int, channels: int, callback: Callable[..., None]
) -> sd.InputStream:
    """Opens and starts a sounddevice InputStream, translating
    PortAudio/OS errors into this package's own exception types rather
    than leaking raw PortAudio errors up through microphone.py."""
    return _open_stream(sd.InputStream, device=device, samplerate=samplerate, channels=channels, callback=callback)


def open_output_stream(
    *,
    device: int | str | None,
    samplerate: int,
    channels: int,
    callback: Callable[..., None],
    finished_callback: Callable[[], None] | None = None,
) -> sd.OutputStream:
    """Opens and starts a sounddevice OutputStream - same error
    translation as open_input_stream, for the playback side.
    `finished_callback` fires when playback completes naturally (the
    stream's own callback raises sd.CallbackStop), distinct from an
    explicit stop() call - see speaker.py, which needs to tell those
    two cases apart to correctly track what's currently playing."""
    return _open_stream(
        sd.OutputStream,
        device=device,
        samplerate=samplerate,
        channels=channels,
        callback=callback,
        finished_callback=finished_callback,
    )


def _open_stream(stream_cls: Callable[..., Any], *, device: int | str | None, **kwargs: Any) -> Any:
    try:
        stream = stream_cls(device=device, **kwargs)
        stream.start()
        return stream
    except PermissionError as exc:
        raise DevicePermissionError(f"Permission denied opening audio device {device!r}") from exc
    except (sd.PortAudioError, OSError) as exc:
        raise DeviceNotFoundError(f"Could not open audio device {device!r}: {exc}") from exc
