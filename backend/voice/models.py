"""Voice-layer domain types.

The actual provider contracts - `SpeechToTextProvider`,
`TextToSpeechProvider`, `ProviderNotConfiguredError` - already live in
voice/base.py and are relied on by the live `/api/v1/voice` routes and
`VoiceService`; this module doesn't redefine or duplicate them. What's
here is the small piece those didn't need yet: naming which concrete
provider is meant to be active, so voice/config.py has something
typed to select from instead of a bare string.
"""

from __future__ import annotations

from enum import Enum


class SttProviderName(str, Enum):
    FASTER_WHISPER = "faster_whisper"
    OPENAI = "openai"


class TtsProviderName(str, Enum):
    ELEVENLABS = "elevenlabs"
    OPENAI = "openai"
    PIPER = "piper"
