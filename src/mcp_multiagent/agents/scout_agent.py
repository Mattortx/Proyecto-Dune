from __future__ import annotations

from . import __name__ as _pkg
from ..agent_base import BaseMutantAgent
from ..protocol import MCPMessage, MCPResult


class ScoutAgent(BaseMutantAgent):
    def __init__(self) -> None:
        super().__init__(name="scout", capabilities={"research", "discovery"})

    def execute(self, message: MCPMessage) -> MCPResult:
        task = str(message.params.get("task", ""))
        context = message.params.get("context", {})
        novelty = "high" if self.mutation.creativity > 0.65 else "moderate"
        summary = f"[{self.name}] explored task '{task}' with {novelty} novelty"
        return MCPResult(
            id=message.id,
            result={
                "agent": self.name,
                "package": _pkg,
                "summary": summary,
                "context_keys": sorted(list(context.keys())),
                "mutation": {
                    "creativity": self.mutation.creativity,
                    "risk_tolerance": self.mutation.risk_tolerance,
                    "aggression": self.mutation.aggression,
                },
            },
        )
