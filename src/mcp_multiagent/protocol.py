from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
import uuid


MCP_VERSION = "2026-04"


@dataclass(slots=True)
class MCPMessage:
    """Lightweight MCP envelope based on JSON-RPC style fields."""

    jsonrpc: str = "2.0"
    method: str = ""
    params: dict[str, Any] = field(default_factory=dict)
    id: str = field(default_factory=lambda: str(uuid.uuid4()))


@dataclass(slots=True)
class MCPResult:
    """Response payload produced by an agent or tool."""

    id: str
    result: dict[str, Any]


@dataclass(slots=True)
class MCPError:
    """Error payload compatible with JSON-RPC conventions."""

    id: str
    code: int
    message: str
    data: dict[str, Any] = field(default_factory=dict)


def make_task_message(task: str, context: dict[str, Any] | None = None) -> MCPMessage:
    return MCPMessage(
        method="agent.execute",
        params={
            "mcp_version": MCP_VERSION,
            "task": task,
            "context": context or {},
        },
    )
