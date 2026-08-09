from typing import Any

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    agent_mode: str = "supervisor"


class ChatResponse(BaseModel):
    response: str
    metadata: dict[str, Any] | None = None
