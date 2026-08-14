"""Cloud TTS via OpenAI's speech endpoint - the secondary TTS provider
per the voice stack (ElevenLabs is primary, Piper the offline fallback).
"""

from __future__ import annotations

from openai import AsyncOpenAI

from voice.tts.base import TextToSpeechProvider


class OpenAITTS(TextToSpeechProvider):
    def __init__(self, api_key: str, model: str = "tts-1", voice: str = "onyx") -> None:
        if not api_key:
            raise ValueError("OpenAITTS requires an api_key")
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model
        self._voice = voice

    async def synthesize(self, text: str) -> bytes:
        response = await self._client.audio.speech.create(input=text, model=self._model, voice=self._voice)
        return await response.aread()
