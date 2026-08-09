from .state import AgentState


def supervisor_agent(_: AgentState) -> dict[str, object]:
    """Return a clearly labelled unavailable result until agents are implemented."""

    return {
        "messages": ["AI investigation is not configured yet."],
        "next_agent": "FINISH",
    }
