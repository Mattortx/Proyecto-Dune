from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol

from .protocol import MCPMessage, MCPResult


class Agent(Protocol):
    name: str
    capabilities: set[str]

    def execute(self, message: MCPMessage) -> MCPResult:
        ...


@dataclass(slots=True)
class MutationState:
    """Mutable traits the orchestrator can tune at runtime."""

    aggression: float = 0.5
    creativity: float = 0.5
    risk_tolerance: float = 0.5


@dataclass(slots=True)
class BaseMutantAgent:
    name: str
    capabilities: set[str]
    mutation: MutationState = field(default_factory=MutationState)
    stats: dict[str, float] = field(default_factory=lambda: {"success": 0.0, "failure": 0.0, "latency_ms": 0.0})

    def execute(self, message: MCPMessage) -> MCPResult:
        raise NotImplementedError

    def mutate(self, signal: dict[str, Any]) -> None:
        """Adjust behavior traits based on orchestrator feedback."""

        reward = float(signal.get("reward", 0.0))
        penalty = float(signal.get("penalty", 0.0))
        pressure = reward - penalty

        self.mutation.creativity = _clamp(self.mutation.creativity + (0.08 * pressure))
        self.mutation.risk_tolerance = _clamp(self.mutation.risk_tolerance + (0.05 * pressure))
        self.mutation.aggression = _clamp(self.mutation.aggression + (0.03 * pressure))



def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))
