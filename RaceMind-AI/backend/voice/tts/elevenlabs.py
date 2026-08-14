"""Cloud TTS via ElevenLabs - the primary TTS provider per the voice
stack (Piper is the offline fallback, OpenAI TTS the secondary cloud
option).
"""

from __future__ import annotations

from elevenlabs.client import AsyncElevenLabs

from voice.tts.base import TextToSpeechProvider


class ElevenLabsTTS(TextToSpeechProvider):
    def __init__(self, api_key: str, voice_id: str, model_id: str = "eleven_turbo_v2_5") -> None:
        if not api_key:
            raise ValueError("ElevenLabsTTS requires an api_key")
        if not voice_id:
            raise ValueError("ElevenLabsTTS requires a voice_id")
        self._client = AsyncElevenLabs(api_key=api_key)
        self._voice_id = voice_id
        self._model_id = model_id

    async def synthesize(self, text: str) -> bytes:
        # convert() streams audio chunks rather than returning one
        # blob - the ABC promises a single bytes result, so drain the
        # stream here and hand back the concatenated audio.
        chunks = [
            chunk
            async for chunk in self._client.text_to_speech.convert(
                voice_id=self._voice_id, text=text, model_id=self._model_id
            )
        ]
        return b"".join(chunks)
