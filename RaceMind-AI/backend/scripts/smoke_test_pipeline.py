"""Temporary local smoke test - NOT part of the RaceMind AI repo.
Run this on your own Windows machine, from inside backend/, with a
real mic/speaker and OPENAI_API_KEY set:

    set OPENAI_API_KEY=sk-...
    python smoke_test_pipeline.py

Uses OpenAI for both STT and TTS since it needs no local model
download - swap in voice/stt/faster_whisper.py or voice/tts/piper.py
etc. if you'd rather test a different provider.
"""

import asyncio
import os
import uuid

from voice.audio.microphone import Microphone
from voice.audio.speaker import Speaker
from voice.service import VoiceService
from voice.intents.router import OllieRouter
from voice.intents.context import ConversationContext
from voice.intents.models import HandlerContext
from voice.pipeline import VoicePipeline
from radio.queue import RadioMessageQueue
from tests.engineer_state_fixtures import build_state  # dev-only import, fine for a throwaway script


async def main() -> None:
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not set - configure a real LLM provider before this step.")
        return

    from voice.stt.faster_whisper import FasterWhisperSTT
    from voice.tts.piper import PiperTTS

    voice_service = VoiceService(
        stt=FasterWhisperSTT(model_size_or_path="base"),
        tts=PiperTTS(model_path="voice/tts/models/en_US-lessac-medium.onnx")
    )
    radio_queue = RadioMessageQueue()
    router = OllieRouter(radio_queue, context=ConversationContext())
    pipeline = VoicePipeline(Microphone(), Speaker(), voice_service, router, radio_queue)
    ctx = HandlerContext(session_id=uuid.uuid4(), state=build_state(), coaching_service=None)

    print('Say "Fuel?" - recording 3 seconds...')
    pipeline.start_conversation()
    await asyncio.sleep(3)
    response = await pipeline.stop_conversation(ctx)
    print(f"Ollie said: {response.text!r}")
    await asyncio.sleep(2)  # let playback finish


if __name__ == "__main__":
    asyncio.run(main())
