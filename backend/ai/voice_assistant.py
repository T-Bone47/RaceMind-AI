"""Ties `voice.VoiceService` (STT/TTS) together with `ai.llm.LLMClient`
and `ai.memory` into a single "driver keys the radio, engineer answers
back" flow. This is the orchestration layer the blueprint's
`ai/voice_assistant.py` stub was reserved for; the actual speech models
live behind `VoiceService`, which is a future milestone in itself.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from ai.llm import LLMClient, RaceContext
from ai.memory import SessionMemoryStore, session_memory_store
from voice.service import VoiceService


@dataclass
class RadioResponse:
    transcribed_question: str
    answer_text: str
    answer_audio: bytes | None


class VoiceAssistant:
    def __init__(
        self,
        voice_service: VoiceService,
        llm_client: LLMClient,
        memory_store: SessionMemoryStore = session_memory_store,
    ) -> None:
        self.voice_service = voice_service
        self.llm_client = llm_client
        self.memory_store = memory_store

    async def handle_radio_message(
        self, audio_bytes: bytes, context: RaceContext, session_id: uuid.UUID
    ) -> RadioResponse:
        """Full round trip: audio in -> transcribe -> ask -> synthesize -> audio out."""
        question = await self.voice_service.transcribe(audio_bytes)
        return await self._respond(question, context, session_id)

    async def handle_text_message(
        self, question: str, context: RaceContext, session_id: uuid.UUID
    ) -> RadioResponse:
        """Same flow, skipping STT - used when the dashboard sends typed
        text instead of a recorded radio message."""
        return await self._respond(question, context, session_id)

    async def _respond(
        self, question: str, context: RaceContext, session_id: uuid.UUID
    ) -> RadioResponse:
        memory = self.memory_store.get_or_create(session_id)
        answer = await self.llm_client.ask(question, context, memory=memory)
        audio: bytes | None = None
        if self.voice_service.can_speak:
            audio = await self.voice_service.speak(answer)
        return RadioResponse(transcribed_question=question, answer_text=answer, answer_audio=audio)
