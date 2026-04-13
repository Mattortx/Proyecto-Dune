from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

from .main import build_default_orchestrator
from .protocol import MCPMessage


class MCPHandler(BaseHTTPRequestHandler):
    orchestrator = build_default_orchestrator()

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/mcp":
            self.send_error(404, "Not Found")
            return

        length = int(self.headers.get("Content-Length", "0"))
        data = self.rfile.read(length).decode("utf-8")

        try:
            payload = json.loads(data)
            message = MCPMessage(
                jsonrpc=payload.get("jsonrpc", "2.0"),
                method=payload.get("method", "agent.execute"),
                params=payload.get("params", {}),
                id=payload.get("id") or "no-id",
            )
            capability = str(message.params.get("capability", "research"))
            response = self.orchestrator.dispatch(message, required_capability=capability)

            if hasattr(response, "result"):
                out = {"jsonrpc": "2.0", "id": response.id, "result": response.result}
            else:
                out = {
                    "jsonrpc": "2.0",
                    "id": response.id,
                    "error": {"code": response.code, "message": response.message, "data": response.data},
                }
            self._send_json(200, out)
        except Exception as exc:  # pragma: no cover
            self._send_json(
                400,
                {
                    "jsonrpc": "2.0",
                    "id": "unknown",
                    "error": {"code": -32700, "message": "Parse error", "data": {"detail": str(exc)}},
                },
            )

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def serve_http(host: str = "127.0.0.1", port: int = 8765) -> None:
    server = HTTPServer((host, port), MCPHandler)
    print(f"MCP HTTP server listening on http://{host}:{port}/mcp")
    server.serve_forever()


if __name__ == "__main__":
    serve_http()
