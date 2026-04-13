from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class TenantPolicy:
    tenant: str
    allowed_capabilities: set[str] = field(default_factory=set)
    blocked_agents: set[str] = field(default_factory=set)


class PolicyEngine:
    def __init__(self, policies: list[TenantPolicy]) -> None:
        self._policies = {policy.tenant: policy for policy in policies}

    def is_capability_allowed(self, tenant: str, capability: str) -> bool:
        policy = self._policies.get(tenant)
        if policy is None:
            return False
        return capability in policy.allowed_capabilities

    def is_agent_allowed(self, tenant: str, agent_name: str) -> bool:
        policy = self._policies.get(tenant)
        if policy is None:
            return False
        return agent_name not in policy.blocked_agents
