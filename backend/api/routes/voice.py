from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import Response

from api.dependencies import get_voice_service
from auth.dependencies import get_current_user
from database.models.user import User
from voice.base import ProviderNotConfiguredError
from voice.service import VoiceService

router = APIRouter(prefix="/voice", tags=["Voice"])


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile,
    _current_user: Annotated[User, Depends(get_current_user)],
    voice_service: Annotated[VoiceService, Depends(get_voice_service)],
) -> dict[str, str]:
    try:
        text = await voice_service.transcribe(await audio.read())
    except ProviderNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    return {"text": text}


@router.post("/synthesize")
async def synthesize(
    text: str,
    _current_user: Annotated[User, Depends(get_current_user)],
    voice_service: Annotated[VoiceService, Depends(get_voice_service)],
) -> Response:
    try:
        audio_bytes = await voice_service.speak(text)
    except ProviderNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    return Response(content=audio_bytes, media_type="audio/wav")
