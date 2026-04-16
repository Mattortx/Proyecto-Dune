from __future__ import annotations

import json
import sys

from .main import build_default_orchestrator
from .protocol import MCPMessage


def serve_stdio() -> None:
    orchestrator = build_default_orchestrator()

    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue

        try:
            payload = json.loads(raw)
            message = MCPMessage(
                jsonrpc=payload.get("jsonrpc", "2.0"),
                method=payload.get("method", "agent.execute"),
                params=payload.get("params", {}),
                id=payload.get("id") or "no-id",
            )
            capability = str(message.params.get("capability", "research"))
            response = orchestrator.dispatch(message, required_capability=capability)

            if hasattr(response, "result"):
                out = {"jsonrpc": "2.0", "id": response.id, "result": response.result}
            else:
                out = {
                    "jsonrpc": "2.0",
                    "id": response.id,
                    "error": {"code": response.code, "message": response.message, "data": response.data},
                }
        except Exception as exc:  # pragma: no cover
            out = {
                "jsonrpc": "2.0",
                "id": "unknown",
                "error": {"code": -32700, "message": "Parse error", "data": {"detail": str(exc)}},
            }

        sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    serve_stdio()
