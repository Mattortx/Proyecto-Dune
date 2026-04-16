from __future__ import annotations

from ..agent_base import BaseMutantAgent
from ..protocol import MCPMessage, MCPResult


class PlannerAgent(BaseMutantAgent):
    def __init__(self) -> None:
        super().__init__(name="planner", capabilities={"planning", "research"})

    def execute(self, message: MCPMessage) -> MCPResult:
        task = str(message.params.get("task", ""))
        steps = [
            f"descomponer tarea: {task}",
            "priorizar entregables incrementales",
            "asignar agente especialista por capability",
            "definir criterios de validacion",
        ]
        return MCPResult(
            id=message.id,
            result={
                "agent": self.name,
                "plan": steps,
                "mutation": {
                    "creativity": self.mutation.creativity,
                    "risk_tolerance": self.mutation.risk_tolerance,
                    "aggression": self.mutation.aggression,
                },
            },
        )
