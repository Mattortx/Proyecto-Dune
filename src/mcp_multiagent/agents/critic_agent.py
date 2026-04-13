from __future__ import annotations

from ..agent_base import BaseMutantAgent
from ..protocol import MCPMessage, MCPResult


class CriticAgent(BaseMutantAgent):
    def __init__(self) -> None:
        super().__init__(name="critic", capabilities={"critique", "governance"})

    def execute(self, message: MCPMessage) -> MCPResult:
        task = str(message.params.get("task", ""))
        findings = [
            f"riesgo de ambiguedad en objetivo: {task}",
            "falta politicas de seguridad por tenant",
            "definir rollback y observabilidad por fase",
        ]
        return MCPResult(
            id=message.id,
            result={
                "agent": self.name,
                "findings": findings,
                "severity": "medium",
                "mutation": {
                    "creativity": self.mutation.creativity,
                    "risk_tolerance": self.mutation.risk_tolerance,
                    "aggression": self.mutation.aggression,
                },
            },
        )
