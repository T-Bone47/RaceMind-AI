"""Re-exports the existing TTS provider contract from voice.base.

voice/base.py already defines `TextToSpeechProvider` and
`ProviderNotConfiguredError`, and the live `/api/v1/voice` routes,
`api/dependencies.py`, and `ai/voice_assistant.py` already depend on
them from that exact location - so this module doesn't redefine the
ABC, it just re-exports it, symmetric with voice/stt/base.py.
"""

from __future__ import annotations

from voice.base import ProviderNotConfiguredError, TextToSpeechProvider

__all__ = ["TextToSpeechProvider", "ProviderNotConfiguredError"]
