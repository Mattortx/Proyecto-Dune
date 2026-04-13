from __future__ import annotations

from ..agent_base import BaseMutantAgent
from ..protocol import MCPMessage, MCPResult


class BuilderAgent(BaseMutantAgent):
    def __init__(self) -> None:
        super().__init__(name="builder", capabilities={"implementation", "refactor"})

    def execute(self, message: MCPMessage) -> MCPResult:
        task = str(message.params.get("task", ""))
        confidence = "high" if self.mutation.risk_tolerance > 0.55 else "guarded"
        summary = f"[{self.name}] produced an implementation plan for '{task}' ({confidence})"
        return MCPResult(
            id=message.id,
            result={
                "agent": self.name,
                "summary": summary,
                "actions": [
                    "inspect codebase",
                    "apply minimal patch",
                    "validate with tests",
                ],
                "mutation": {
                    "creativity": self.mutation.creativity,
                    "risk_tolerance": self.mutation.risk_tolerance,
                    "aggression": self.mutation.aggression,
                },
            },
        )
