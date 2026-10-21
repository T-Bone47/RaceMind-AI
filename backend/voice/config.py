"""Voice-layer runtime configuration: which STT/TTS provider is active
and the parameters each concrete adapter needs to construct itself.

Mirrors config/settings.py's pydantic-settings pattern exactly (same
BaseSettings/.env approach) but stays a separate class with its own
`VOICE_` env prefix rather than adding fields to the main `Settings` -
these are optional and provider-specific, and most deployments won't
set any of them until a provider is actually chosen. Nothing here is
read by the running app yet; that wiring is a later step.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict

from voice.models import SttProviderName, TtsProviderName


class VoiceSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        env_prefix="VOICE_",
    )

    # --- Provider selection ---
    stt_provider: SttProviderName | None = None
    tts_provider: TtsProviderName | None = None

    # --- faster-whisper (local, offline STT) ---
    faster_whisper_model: str = "base"  # tiny|base|small|medium|large-v3, or a local model path
    faster_whisper_device: str = "cpu"  # "cpu" | "cuda"
    faster_whisper_compute_type: str = "int8"
    # Runs Silero VAD internally via faster-whisper's own onnxruntime
    # dependency - see voice/stt/faster_whisper.py's docstring for why
    # that's used instead of a standalone silero-vad package.
    faster_whisper_vad_filter: bool = True

    # --- OpenAI (shared credential for STT and/or TTS) ---
    openai_api_key: str | None = None
    openai_stt_model: str = "whisper-1"
    openai_tts_model: str = "tts-1"
    openai_tts_voice: str = "onyx"

    # --- ElevenLabs ---
    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str | None = None
    elevenlabs_model: str = "eleven_turbo_v2_5"

    # --- Piper (local, offline TTS) ---
    piper_model_path: str | None = None  # path to a local .onnx voice model
    piper_config_path: str | None = None  # path to the matching .onnx.json
