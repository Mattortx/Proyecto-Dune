from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable
import time

from .agent_base import BaseMutantAgent
from .persistence import MutationStore
from .protocol import MCPError, MCPMessage, MCPResult
from .security import PolicyEngine


@dataclass(slots=True)
class DispatchDecision:
    agent_name: str
    score: float


class MCPOrchestrator:
    def __init__(
        self,
        agents: Iterable[BaseMutantAgent],
        policy_engine: PolicyEngine,
        mutation_store: MutationStore | None = None,
    ) -> None:
        self._agents = {agent.name: agent for agent in agents}
        self._policy_engine = policy_engine
        self._mutation_store = mutation_store

    def bootstrap_tenant(self, tenant: str) -> None:
        if self._mutation_store is None:
            return
        for agent in self._agents.values():
            state = self._mutation_store.load(tenant, agent.name)
            if state is not None:
                agent.mutation = state

    def dispatch(self, message: MCPMessage, required_capability: str) -> MCPResult | MCPError:
        tenant = str(message.params.get("context", {}).get("tenant", "public"))
        if not self._policy_engine.is_capability_allowed(tenant, required_capability):
            return MCPError(
                id=message.id,
                code=-32001,
                message="Capability blocked by tenant policy",
                data={"tenant": tenant, "capability": required_capability},
            )

        self.bootstrap_tenant(tenant)

        candidates = [
            a
            for a in self._agents.values()
            if required_capability in a.capabilities and self._policy_engine.is_agent_allowed(tenant, a.name)
        ]
        if not candidates:
            return MCPError(
                id=message.id,
                code=-32601,
                message=f"No agent with capability '{required_capability}'",
                data={"available_agents": sorted(self._agents.keys()), "tenant": tenant},
            )

        best = max(candidates, key=self._agent_score)
        started = time.perf_counter()
        try:
            result = best.execute(message)
            elapsed_ms = (time.perf_counter() - started) * 1000
            best.stats["success"] += 1
            best.stats["latency_ms"] = elapsed_ms
            best.mutate({"reward": self._reward_for(elapsed_ms), "penalty": 0.0})
            self._persist_mutation(tenant, best)
            return result
        except Exception as exc:  # pragma: no cover - defensive path
            best.stats["failure"] += 1
            best.mutate({"reward": 0.0, "penalty": 0.35})
            self._persist_mutation(tenant, best)
            return MCPError(
                id=message.id,
                code=-32000,
                message="Agent execution failed",
                data={"agent": best.name, "error": str(exc)},
            )

    def _persist_mutation(self, tenant: str, agent: BaseMutantAgent) -> None:
        if self._mutation_store is None:
            return
        self._mutation_store.save(tenant, agent)

    def _agent_score(self, agent: BaseMutantAgent) -> float:
        success = agent.stats["success"]
        failure = agent.stats["failure"]
        reliability = (success + 1.0) / (success + failure + 1.0)
        return (0.65 * reliability) + (0.35 * agent.mutation.creativity)

    @staticmethod
    def _reward_for(latency_ms: float) -> float:
        if latency_ms < 80:
            return 0.30
        if latency_ms < 200:
            return 0.18
        return 0.05

    def snapshot(self) -> dict[str, dict[str, float]]:
        return {
            name: {
                "creativity": a.mutation.creativity,
                "risk_tolerance": a.mutation.risk_tolerance,
                "aggression": a.mutation.aggression,
                "success": a.stats["success"],
                "failure": a.stats["failure"],
                "latency_ms": a.stats["latency_ms"],
            }
            for name, a in self._agents.items()
        }
