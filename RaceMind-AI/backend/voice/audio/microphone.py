"""Push-to-talk microphone capture. Records via a callback-driven
sounddevice InputStream (not sd.rec(), which needs a fixed frame count
known in advance - push-to-talk duration is whatever the driver holds
the button for) and returns the recording as WAV-encoded bytes, the
format every STT provider in voice/stt/ already expects.

Timeout enforcement (a driver holding push-to-talk too long) is the
caller's responsibility, not this class's - see voice/pipeline.py,
which wraps stop() with an async timeout. Stopping a stream from
within its own audio callback thread is unsafe, so this class doesn't
attempt a self-enforced timeout internally.
"""

from __future__ import annotations

import io

import numpy as np
import soundfile as sf
from sounddevice import InputStream

from voice.audio.stream import open_input_stream

DEFAULT_SAMPLERATE = 16000  # matches what faster-whisper and most STT providers expect
DEFAULT_CHANNELS = 1


class Microphone:
    def __init__(
        self,
        device: int | str | None = None,
        samplerate: int = DEFAULT_SAMPLERATE,
        channels: int = DEFAULT_CHANNELS,
    ) -> None:
        self._device = device
        self._samplerate = samplerate
        self._channels = channels
        self._stream: InputStream | None = None
        self._chunks: list[np.ndarray] = []

    @property
    def is_recording(self) -> bool:
        return self._stream is not None

    def start(self) -> None:
        """Begin recording - call on push-to-talk press, or any manual
        trigger. A second call while already recording is a no-op, not
        an error - a driver pressing again before release shouldn't
        restart the clip."""
        if self.is_recording:
            return
        self._chunks = []
        self._stream = open_input_stream(
            device=self._device, samplerate=self._samplerate, channels=self._channels, callback=self._on_audio
        )

    def _on_audio(self, indata: np.ndarray, frames: int, time_info: object, status: object) -> None:
        self._chunks.append(indata.copy())

    def stop(self) -> bytes:
        """End recording - call on push-to-talk release, or any manual
        trigger. Returns the recording as WAV-encoded bytes (a valid
        but silent/empty WAV if nothing was ever captured - "was there
        actual speech in this" is a transcription-level question, not
        this class's to answer)."""
        if self._stream is not None:
            self._stream.stop()
            self._stream.close()
            self._stream = None

        audio = (
            np.concatenate(self._chunks, axis=0)
            if self._chunks
            else np.zeros((0, self._channels), dtype=np.float32)
        )
        buffer = io.BytesIO()
        sf.write(buffer, audio, samplerate=self._samplerate, format="WAV", subtype="PCM_16")
        return buffer.getvalue()
