from fastapi import APIRouter, Body
from config.settings import get_settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.post("/gemini-key")
async def update_gemini_key(api_key: str = Body(..., embed=True)):
    settings = get_settings()
    settings.gemini_api_key = api_key
    return {"status": "success"}
