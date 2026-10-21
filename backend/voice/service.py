"""Coordinates whichever STT/TTS providers are configured.

Both provider slots are optional so the rest of the app - the voice API
route, the voice assistant orchestrator - can be built and tested
without local speech models installed. Calling `transcribe`/`speak`
without a provider configured raises a clear, specific error instead of
a confusing `AttributeError` on `None`.
"""

from __future__ import annotations

from voice.base import ProviderNotConfiguredError, SpeechToTextProvider, TextToSpeechProvider


class VoiceService:
    def __init__(
        self,
        stt: SpeechToTextProvider | None = None,
        tts: TextToSpeechProvider | None = None,
    ) -> None:
        self.stt = stt
        self.tts = tts

    @property
    def can_transcribe(self) -> bool:
        return self.stt is not None

    @property
    def can_speak(self) -> bool:
        return self.tts is not None

    async def transcribe(self, audio_bytes: bytes) -> str:
        if self.stt is None:
            raise ProviderNotConfiguredError(
                "No SpeechToTextProvider configured yet - local Whisper integration is a future milestone."
            )
        return await self.stt.transcribe(audio_bytes)

    async def speak(self, text: str) -> bytes:
        if self.tts is None:
            raise ProviderNotConfiguredError(
                "No TextToSpeechProvider configured yet - local TTS integration is a future milestone."
            )
        return await self.tts.synthesize(text)
