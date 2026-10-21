from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from ai.llm import AIEngineerNotConfiguredError, RaceContext
from ai.voice_assistant import VoiceAssistant
from api.dependencies import get_voice_assistant
from api.schemas.ai import AskRequest, AskResponse
from auth.dependencies import get_current_user
from database.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Engineer"])


@router.post("/ask", response_model=AskResponse)
async def ask_engineer(
    payload: AskRequest,
    _current_user: Annotated[User, Depends(get_current_user)],
    assistant: Annotated[VoiceAssistant, Depends(get_voice_assistant)],
) -> AskResponse:
    context = RaceContext(**payload.context.model_dump())
    try:
        response = await assistant.handle_text_message(payload.question, context, payload.session_id)
    except AIEngineerNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    return AskResponse(answer=response.answer_text)
