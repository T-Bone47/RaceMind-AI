"""Temporary local smoke test - NOT part of the RaceMind AI repo.
Run this on your own Windows machine, from inside backend/, with a
real speaker and OPENAI_API_KEY set:

    set OPENAI_API_KEY=sk-...
    python smoke_test_radio.py

No microphone needed for this one - it only exercises the
engineer-initiated radio path (Recommendation -> RadioMessageQueue ->
radio/delivery.py -> TTS -> Speaker), not the driver-question path.
"""

import asyncio

from database.models.enums import TyreCompound
from engineer import tyre_advisor
from engineer.models import TyreState
from radio.queue import RadioMessageQueue
from voice.audio.microphone import Microphone
from voice.audio.speaker import Speaker
from voice.pipeline import VoicePipeline
from voice.service import VoiceService


async def main() -> None:
    from dotenv import load_dotenv
    load_dotenv()
    from voice.tts.piper import PiperTTS

    voice_service = VoiceService(stt=None, tts=PiperTTS(model_path="voice/tts/models/en_US-lessac-medium.onnx"))
    radio_queue = RadioMessageQueue()
    pipeline = VoicePipeline(Microphone(), Speaker(), voice_service, None, radio_queue)  # router unused this path

    worn_tyres = TyreState(compound=TyreCompound.SOFT, age_laps=25, wear_pct=92.0)
    radio_queue.enqueue(tyre_advisor.analyze(worn_tyres))
    print("Enqueued a real tyre Recommendation - delivering...")
    delivered = await pipeline.deliver_next_radio_message()
    print(f"Delivered: {delivered}")
    await asyncio.sleep(3)


if __name__ == "__main__":
    asyncio.run(main())
