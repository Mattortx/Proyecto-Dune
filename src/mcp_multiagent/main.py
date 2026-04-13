from __future__ import annotations

import json

from .agents.builder_agent import BuilderAgent
from .agents.critic_agent import CriticAgent
from .agents.planner_agent import PlannerAgent
from .agents.scout_agent import ScoutAgent
from .orchestrator import MCPOrchestrator
from .persistence import SQLiteMutationStore
from .protocol import MCPError, make_task_message
from .security import PolicyEngine, TenantPolicy


def build_default_orchestrator() -> MCPOrchestrator:
    policies = [
        TenantPolicy(
            tenant="dune",
            allowed_capabilities={"research", "implementation", "planning", "critique", "governance"},
            blocked_agents=set(),
        )
    ]
    return MCPOrchestrator(
        agents=[PlannerAgent(), ScoutAgent(), BuilderAgent(), CriticAgent()],
        policy_engine=PolicyEngine(policies=policies),
        mutation_store=SQLiteMutationStore(),
    )


def run_demo() -> None:
    orchestrator = build_default_orchestrator()

    tasks = [
        ("planning", "Diseñar flujo de ejecucion de agentes mutantes"),
        ("research", "Mapear requisitos para protocolo MCP multiagente"),
        ("implementation", "Diseñar contrato del orquestador con agentes mutantes"),
        ("critique", "Detectar riesgos de escalado y observabilidad"),
    ]

    for capability, task in tasks:
        msg = make_task_message(task=task, context={"tenant": "dune", "trace_id": "demo-001"})
        response = orchestrator.dispatch(message=msg, required_capability=capability)

        if isinstance(response, MCPError):
            print(json.dumps({"error": response.__dict__}, indent=2, ensure_ascii=False))
            continue

        print(json.dumps(response.result, indent=2, ensure_ascii=False))

    print("\n== Agent Snapshot ==")
    print(json.dumps(orchestrator.snapshot(), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    run_demo()
