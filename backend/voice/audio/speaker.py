"""Priority-aware, interruptible speaker playback.

Reuses engineer.models.priority_rank/RecommendationPriority for
interruption decisions rather than inventing a second priority scheme.
A message ranked above whatever's currently playing interrupts it;
anything ranked equal or lower is rejected outright rather than
queued - radio/queue.py is already the queue, so this class
deliberately doesn't grow a second, smaller one of its own, and
rejecting rather than buffering matches the "avoid unnecessary
buffering" instruction.
"""

from __future__ import annotations

import io

import numpy as np
import soundfile as sf
from sounddevice import CallbackStop, OutputStream

from engineer.models import RecommendationPriority, priority_rank
from voice.audio.stream import open_output_stream


class Speaker:
    def __init__(self, device: int | str | None = None) -> None:
        self._device = device
        self._stream: OutputStream | None = None
        self._audio: np.ndarray = np.zeros((0, 1), dtype=np.float32)
        self._position = 0
        self._current_priority: RecommendationPriority | None = None

    @property
    def is_playing(self) -> bool:
        return self._stream is not None

    def play(self, audio_bytes: bytes, *, priority: RecommendationPriority) -> bool:
        """Non-blocking. Returns True if playback started - either
        nothing was playing, or this message outranks what was and
        interrupted it. Returns False if rejected because something
        ranked equal or higher is already playing; nothing is queued
        in that case (see this module's docstring)."""
        if self._current_priority is not None and priority_rank(priority) <= priority_rank(self._current_priority):
            return False
        if self.is_playing:
            self.stop()

        data, samplerate = sf.read(io.BytesIO(audio_bytes), dtype="float32", always_2d=True)
        self._audio = data
        self._position = 0
        self._current_priority = priority
        self._stream = open_output_stream(
            device=self._device,
            samplerate=int(samplerate),
            channels=data.shape[1],
            callback=self._on_playback,
            finished_callback=self._on_finished,
        )
        return True

    def stop(self) -> None:
        """Halts current playback immediately - used both for an
        explicit caller-requested stop and internally before starting
        a higher-priority interruption."""
        if self._stream is not None:
            self._stream.stop()
            self._stream.close()
            self._stream = None
        self._current_priority = None

    def _on_playback(self, outdata: np.ndarray, frames: int, time_info: object, status: object) -> None:
        remaining = len(self._audio) - self._position
        if remaining <= 0:
            outdata.fill(0)
            raise CallbackStop
        n = min(frames, remaining)
        outdata[:n] = self._audio[self._position : self._position + n]
        if n < frames:
            outdata[n:].fill(0)
        self._position += n

    def _on_finished(self) -> None:
        # Playback completed naturally (ran out of audio) rather than
        # via an explicit stop() call - clear our own state to match,
        # but don't call stream.stop()/close() here: the stream is
        # already in the process of stopping itself at this point.
        self._stream = None
        self._current_priority = None
