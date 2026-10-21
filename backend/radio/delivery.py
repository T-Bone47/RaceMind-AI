"""Wires RadioMessageQueue to the existing voice.service.VoiceService -
the "future text-to-speech integration" the queue prepares messages for
already has somewhere real to plug into, not just a shape that matches
one. Until a real STT/TTS provider is configured, VoiceService.speak()
raises ProviderNotConfiguredError (see voice/base.py) - this helper
surfaces that the same way the rest of the codebase already does
elsewhere (fail closed with a clear error) rather than swallowing it.
"""

from __future__ import annotations

from dataclasses import dataclass

from radio.models import RadioMessage
from radio.queue import RadioMessageQueue
from voice.service import VoiceService


@dataclass(frozen=True)
class DeliveryResult:
    message: RadioMessage
    audio: bytes | None  # None if no TTS provider is configured yet


async def deliver_next(
    queue: RadioMessageQueue, voice_service: VoiceService, *, speak: bool = True
) -> DeliveryResult | None:
    """Dequeues the highest-priority pending message and, if a TTS
    provider is configured, synthesizes it. Returns None if the queue is
    empty. `speak=False` dequeues without attempting synthesis - useful
    for text-only delivery paths (e.g. the dashboard's message log)."""
    message = queue.dequeue()
    if message is None:
        return None

    audio: bytes | None = None
    if speak and voice_service.can_speak:
        payload = message.to_speech_payload()
        audio = await voice_service.speak(payload.text)

    return DeliveryResult(message=message, audio=audio)
