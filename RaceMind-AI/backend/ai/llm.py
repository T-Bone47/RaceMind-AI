"""LLM client for the AI Engineer.

A thin, genuinely functional wrapper around the Anthropic SDK - given a
valid ANTHROPIC_API_KEY this works end to end. It raises a clear,
specific error rather than a confusing SDK stack trace when the key
isn't configured, since that's the most likely reason someone hits this
in local dev.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from anthropic import AsyncAnthropic

from ai.memory import SessionMemory
from ai.prompts import RACE_ENGINEER_SYSTEM_PROMPT
from config.settings import Settings, get_settings


@dataclass
class RaceContext:
    """Snapshot of session state handed to the AI Engineer as grounding
    context - the model is instructed never to invent numbers beyond this."""

    current_lap: int
    total_laps: int
    position: int
    tyre_compound: str
    tyre_age_laps: int
    gap_to_ahead_s: float | None = None
    gap_to_behind_s: float | None = None
    recent_events: list[str] = field(default_factory=list)

    def as_prompt_text(self) -> str:
        text = (
            f"Lap {self.current_lap}/{self.total_laps}, P{self.position}, "
            f"{self.tyre_compound} tyres ({self.tyre_age_laps} laps old)."
        )
        if self.gap_to_ahead_s is not None:
            text += f" Gap ahead: {self.gap_to_ahead_s:+.1f}s."
        if self.gap_to_behind_s is not None:
            text += f" Gap behind: {self.gap_to_behind_s:+.1f}s."
        if self.recent_events:
            text += " Recent: " + "; ".join(self.recent_events) + "."
        return text


class AIEngineerNotConfiguredError(RuntimeError):
    pass


class LLMClient:
    """Wraps the Anthropic Messages API for race-engineer Q&A."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client: AsyncAnthropic | None = (
            AsyncAnthropic(api_key=self._settings.anthropic_api_key)
            if self._settings.anthropic_api_key
            else None
        )

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    async def ask(
        self, question: str, context: RaceContext, memory: SessionMemory | None = None
    ) -> str:
        if self._client is None:
            raise AIEngineerNotConfiguredError(
                "ANTHROPIC_API_KEY is not set - add it to backend/.env to enable the AI Engineer."
            )

        prompt_parts = [f"Race context: {context.as_prompt_text()}"]
        if memory is not None:
            conversation = memory.conversation_context()
            if conversation:
                prompt_parts.append(conversation)
        prompt_parts.append(f"Driver: {question}")

        response = await self._client.messages.create(
            model=self._settings.anthropic_model,
            max_tokens=self._settings.anthropic_max_tokens,
            system=RACE_ENGINEER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": "\n\n".join(prompt_parts)}],
        )
        answer = "".join(block.text for block in response.content if block.type == "text")

        if memory is not None:
            memory.record_exchange(question, answer)

        return answer
