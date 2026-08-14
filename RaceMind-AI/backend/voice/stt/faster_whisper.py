"""Local, offline STT via faster-whisper (CTranslate2 Whisper) - the
primary STT provider per the voice stack.

VAD: faster-whisper's own `vad_filter` option runs Silero VAD
internally (its vad.py module's own docstrings describe the Silero
speech-probability algorithm it implements; the ONNX weights ship via
faster-whisper's onnxruntime dependency, no separate PyTorch needed).
That's what satisfies this project's "prefer Silero VAD" requirement -
a standalone `silero-vad` package would just pull in the same model a
second time behind a much heavier torch dependency for no real gain,
so it's intentionally not installed separately. See the Step 1 report
for how this was verified against the installed package.

Model loading happens lazily on first use, not in __init__, so
constructing this adapter (e.g. just to check whether a provider is
configured) never pays the model-load cost.
"""

from __future__ import annotations

import asyncio
import io

from faster_whisper import WhisperModel

from voice.stt.base import SpeechToTextProvider


class FasterWhisperSTT(SpeechToTextProvider):
    def __init__(
        self,
        model_size_or_path: str = "base",
        device: str = "cpu",
        compute_type: str = "int8",
        vad_filter: bool = True,
    ) -> None:
        self._model_size_or_path = model_size_or_path
        self._device = device
        self._compute_type = compute_type
        self._vad_filter = vad_filter
        self._model: WhisperModel | None = None

    def _get_model(self) -> WhisperModel:
        if self._model is None:
            self._model = WhisperModel(
                self._model_size_or_path, device=self._device, compute_type=self._compute_type
            )
        return self._model

    async def transcribe(self, audio_bytes: bytes) -> str:
        # faster-whisper's transcribe() is sync/blocking CPU-or-GPU
        # inference - run it off the event loop so one transcription
        # doesn't stall every other coroutine in the process.
        return await asyncio.to_thread(self._transcribe_sync, audio_bytes)

    def _transcribe_sync(self, audio_bytes: bytes) -> str:
        model = self._get_model()
        segments, _info = model.transcribe(io.BytesIO(audio_bytes), vad_filter=self._vad_filter)
        return "".join(segment.text for segment in segments).strip()
