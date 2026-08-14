"""Re-exports the existing STT provider contract from voice.base.

voice/base.py already defines `SpeechToTextProvider` and
`ProviderNotConfiguredError`, and the live `/api/v1/voice` routes,
`api/dependencies.py`, and `ai/voice_assistant.py` already depend on
them from that exact location - so this module doesn't redefine the
ABC, it just re-exports it. It exists so concrete adapters in this
subpackage can do `from voice.stt.base import SpeechToTextProvider`,
symmetric with how tts/base.py does the same for the TTS side,
without a second, parallel interface for the same concept.
"""

from __future__ import annotations

from voice.base import ProviderNotConfiguredError, SpeechToTextProvider

__all__ = ["SpeechToTextProvider", "ProviderNotConfiguredError"]
