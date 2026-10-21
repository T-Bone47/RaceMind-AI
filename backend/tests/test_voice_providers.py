from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from voice.base import SpeechToTextProvider, TextToSpeechProvider
from voice.stt.faster_whisper import FasterWhisperSTT
from voice.stt.openai import OpenAISTT
from voice.tts.elevenlabs import ElevenLabsTTS
from voice.tts.openai import OpenAITTS
from voice.tts.piper import PiperTTS


def test_faster_whisper_stt_is_a_speech_to_text_provider():
    assert issubclass(FasterWhisperSTT, SpeechToTextProvider)


def test_faster_whisper_stt_does_not_load_model_until_first_use(monkeypatch):
    mock_model_cls = MagicMock()
    monkeypatch.setattr("voice.stt.faster_whisper.WhisperModel", mock_model_cls)

    FasterWhisperSTT()

    mock_model_cls.assert_not_called()


async def test_faster_whisper_stt_joins_and_strips_segment_text(monkeypatch):
    fake_segment_1 = MagicMock(text="Box this lap. ")
    fake_segment_2 = MagicMock(text="Confirm.")
    fake_model = MagicMock()
    fake_model.transcribe.return_value = ([fake_segment_1, fake_segment_2], MagicMock())
    monkeypatch.setattr("voice.stt.faster_whisper.WhisperModel", MagicMock(return_value=fake_model))

    adapter = FasterWhisperSTT(vad_filter=True)
    result = await adapter.transcribe(b"fake-audio-bytes")

    assert result == "Box this lap. Confirm."
    _, kwargs = fake_model.transcribe.call_args
    assert kwargs["vad_filter"] is True


async def test_faster_whisper_stt_reuses_loaded_model_across_calls(monkeypatch):
    fake_model = MagicMock()
    fake_model.transcribe.return_value = ([], MagicMock())
    mock_model_cls = MagicMock(return_value=fake_model)
    monkeypatch.setattr("voice.stt.faster_whisper.WhisperModel", mock_model_cls)

    adapter = FasterWhisperSTT()
    await adapter.transcribe(b"one")
    await adapter.transcribe(b"two")

    mock_model_cls.assert_called_once()  # constructed once, not per-call


# --- OpenAISTT ---


def test_openai_stt_is_a_speech_to_text_provider():
    assert issubclass(OpenAISTT, SpeechToTextProvider)


def test_openai_stt_rejects_missing_api_key():
    with pytest.raises(ValueError, match="api_key"):
        OpenAISTT(api_key="")


async def test_openai_stt_extracts_text_from_transcription_object(monkeypatch):
    adapter = OpenAISTT(api_key="sk-fake")
    fake_result = MagicMock(text="Box this lap.")
    adapter._client.audio.transcriptions.create = AsyncMock(return_value=fake_result)

    result = await adapter.transcribe(b"fake-audio-bytes")

    assert result == "Box this lap."
    _, kwargs = adapter._client.audio.transcriptions.create.call_args
    assert kwargs["model"] == "whisper-1"
    assert kwargs["file"][2] == "audio/wav"


async def test_openai_stt_falls_back_to_str_when_no_text_attribute(monkeypatch):
    adapter = OpenAISTT(api_key="sk-fake")
    adapter._client.audio.transcriptions.create = AsyncMock(return_value="plain string result")

    result = await adapter.transcribe(b"fake-audio-bytes")

    assert result == "plain string result"


# --- ElevenLabsTTS ---


def test_elevenlabs_tts_is_a_text_to_speech_provider():
    assert issubclass(ElevenLabsTTS, TextToSpeechProvider)


def test_elevenlabs_tts_rejects_missing_api_key():
    with pytest.raises(ValueError, match="api_key"):
        ElevenLabsTTS(api_key="", voice_id="voice-1")


def test_elevenlabs_tts_rejects_missing_voice_id():
    with pytest.raises(ValueError, match="voice_id"):
        ElevenLabsTTS(api_key="key-1", voice_id="")


async def test_elevenlabs_tts_drains_and_concatenates_stream():
    adapter = ElevenLabsTTS(api_key="key-1", voice_id="voice-1")

    async def fake_stream(*args, **kwargs):
        for chunk in (b"chunk-a-", b"chunk-b-", b"chunk-c"):
            yield chunk

    adapter._client.text_to_speech.convert = MagicMock(side_effect=fake_stream)

    result = await adapter.synthesize("Box this lap.")

    assert result == b"chunk-a-chunk-b-chunk-c"


# --- OpenAITTS ---


def test_openai_tts_is_a_text_to_speech_provider():
    assert issubclass(OpenAITTS, TextToSpeechProvider)


def test_openai_tts_rejects_missing_api_key():
    with pytest.raises(ValueError, match="api_key"):
        OpenAITTS(api_key="")


async def test_openai_tts_reads_full_response_body():
    adapter = OpenAITTS(api_key="sk-fake")
    fake_response = MagicMock()
    fake_response.aread = AsyncMock(return_value=b"synthesized-audio-bytes")
    adapter._client.audio.speech.create = AsyncMock(return_value=fake_response)

    result = await adapter.synthesize("Box this lap.")

    assert result == b"synthesized-audio-bytes"
    _, kwargs = adapter._client.audio.speech.create.call_args
    assert kwargs["voice"] == "onyx"


# --- PiperTTS ---


def test_piper_tts_is_a_text_to_speech_provider():
    assert issubclass(PiperTTS, TextToSpeechProvider)


def test_piper_tts_rejects_missing_model_path():
    with pytest.raises(ValueError, match="model_path"):
        PiperTTS(model_path="")


def test_piper_tts_does_not_load_voice_until_first_use(monkeypatch):
    mock_load = MagicMock()
    monkeypatch.setattr("voice.tts.piper.PiperVoice.load", mock_load)

    PiperTTS(model_path="/fake/model.onnx")

    mock_load.assert_not_called()


async def test_piper_tts_produces_valid_wav_bytes(monkeypatch):
    def fake_synthesize_wav(text, wav_file, syn_config=None, include_alignments=False):
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(22050)
        wav_file.writeframes(b"\x00\x00" * 100)

    fake_voice = MagicMock()
    fake_voice.synthesize_wav.side_effect = fake_synthesize_wav
    monkeypatch.setattr("voice.tts.piper.PiperVoice.load", MagicMock(return_value=fake_voice))

    adapter = PiperTTS(model_path="/fake/model.onnx")
    result = await adapter.synthesize("Box this lap.")

    assert result[:4] == b"RIFF"
    assert result[8:12] == b"WAVE"
    fake_voice.synthesize_wav.assert_called_once()
    assert fake_voice.synthesize_wav.call_args[0][0] == "Box this lap."
