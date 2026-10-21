"""Local, offline TTS via Piper - the offline fallback per the voice
stack (ElevenLabs is primary, OpenAI TTS the secondary cloud option).

Voice loading happens lazily on first use, not in __init__, matching
voice/stt/faster_whisper.py's approach for the same reason: constructing
this adapter shouldn't pay the model-load cost until it's actually used.
"""

from __future__ import annotations

import asyncio
import io
import wave

from piper import PiperVoice

from voice.tts.base import TextToSpeechProvider


class PiperTTS(TextToSpeechProvider):
    def __init__(self, model_path: str, config_path: str | None = None) -> None:
        if not model_path:
            raise ValueError("PiperTTS requires a model_path")
        self._model_path = model_path
        self._config_path = config_path
        self._voice: PiperVoice | None = None

    def _get_voice(self) -> PiperVoice:
        if self._voice is None:
            self._voice = PiperVoice.load(self._model_path, config_path=self._config_path)
        return self._voice

    async def synthesize(self, text: str) -> bytes:
        # PiperVoice.synthesize_wav() is sync/blocking - run it off the
        # event loop, same reasoning as the faster-whisper STT adapter.
        return await asyncio.to_thread(self._synthesize_sync, text)

    def _synthesize_sync(self, text: str) -> bytes:
        voice = self._get_voice()
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file)
        return buffer.getvalue()
