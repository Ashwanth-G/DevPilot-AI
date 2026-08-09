import operator
from collections.abc import Sequence
from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_agent: str
    current_incident_id: str | None
    investigation_status: str | None
