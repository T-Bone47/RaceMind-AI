"""Cloud STT via OpenAI's audio transcription endpoint - the optional,
secondary STT provider per the voice stack (faster-whisper is primary).
"""

from __future__ import annotations

from openai import AsyncOpenAI

from voice.stt.base import SpeechToTextProvider


class OpenAISTT(SpeechToTextProvider):
    def __init__(self, api_key: str, model: str = "whisper-1") -> None:
        if not api_key:
            raise ValueError("OpenAISTT requires an api_key")
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def transcribe(self, audio_bytes: bytes) -> str:
        result = await self._client.audio.transcriptions.create(
            file=("audio.wav", audio_bytes, "audio/wav"),
            model=self._model,
        )
        # Default response_format returns a Transcription object with
        # .text; explicitly requesting response_format="text" returns
        # a bare str instead. Handling both keeps this correct either
        # way without depending on the SDK's current default.
        text = getattr(result, "text", None)
        return text if text is not None else str(result)
