"""Speech-to-text and text-to-speech provider contracts.

Interfaces only for now - loading and running local Whisper (STT) and a
local TTS engine is a meaningfully heavier dependency than the rest of
this API (model weights, audio codecs), so that's a separate milestone.
Shipping the interface now means the API layer (backend/api/routes/voice.py)
and `ai/voice_assistant.py` can be built and tested against it today.
"""

from __future__ import annotations

import abc


class SpeechToTextProvider(abc.ABC):
    @abc.abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str: ...


class TextToSpeechProvider(abc.ABC):
    @abc.abstractmethod
    async def synthesize(self, text: str) -> bytes: ...


class ProviderNotConfiguredError(RuntimeError):
    pass
