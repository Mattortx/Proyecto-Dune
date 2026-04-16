# MCP Multiagent Core

Nucleo para gestionar un sistema multiagente con protocolo MCP y un orquestador central con agentes mutantes.

## Componentes

- `protocol.py`: sobres MCP estilo JSON-RPC (`MCPMessage`, `MCPResult`, `MCPError`).
- `agent_base.py`: contrato base de agentes y estado de mutacion.
- `orchestrator.py`: enrutado por capacidades, scoring y feedback de mutacion.
- `security.py`: politicas por tenant y bloqueo por agente.
- `persistence.py`: estado de mutacion en SQLite y opcion PostgreSQL.
- `agents/`: implementaciones (`PlannerAgent`, `ScoutAgent`, `BuilderAgent`, `CriticAgent`).
- `main.py`: demo local de orquestacion.
- `transport_stdio.py`: servidor MCP por stdio (JSON por linea).
- `transport_http.py`: servidor MCP por HTTP (`POST /mcp`).

## Ejecutar demo

Desde la raiz del repositorio:

```bash
python -m src.mcp_multiagent.main
```

## Ejecutar servidor MCP por stdio

```bash
python -m src.mcp_multiagent.transport_stdio
```

Ejemplo de request (una linea JSON):

```json
{"jsonrpc":"2.0","id":"1","method":"agent.execute","params":{"task":"Diseñar estrategia multiagente","capability":"planning","context":{"tenant":"dune"}}}
```

## Ejecutar servidor MCP por HTTP

```bash
python -m src.mcp_multiagent.transport_http
```

Ejemplo de request:

```bash
curl -s http://127.0.0.1:8765/mcp \
	-H 'Content-Type: application/json' \
	-d '{"jsonrpc":"2.0","id":"42","method":"agent.execute","params":{"task":"Auditar riesgos","capability":"critique","context":{"tenant":"dune"}}}'
```

## PostgreSQL opcional

Instala dependencias opcionales:

```bash
pip install .[postgres]
```

Despues usa `PostgresMutationStore` en vez de `SQLiteMutationStore`.
