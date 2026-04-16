# Arquitectura MCP Multiagentes

## Objetivo

Gestionar un sistema multiagente con protocolo MCP, gobernado por un orquestador central capaz de ajustar el comportamiento de cada agente (agentes mutantes) segun rendimiento operativo.

## Bloques

1. Gateway MCP
- Entrada de solicitudes por JSON-RPC/MCP.
- Normalizacion de mensajes y validacion de esquema.

2. Orquestador
- Enrutado por capability.
- Seleccion de agente por score dinamico (fiabilidad + mutacion).
- Politicas de reintento y timeouts.

3. Agentes mutantes
- Cada agente declara capabilities.
- Estado mutable: creatividad, agresividad, tolerancia al riesgo.
- Mutacion por feedback (reward/penalty) tras cada ejecucion.

4. Estado y observabilidad
- Snapshot de rasgos y estadisticas por agente.
- Futuro: almacenamiento en Redis/PostgreSQL + OpenTelemetry.

## Flujo minimo

1. Llega mensaje MCP con tarea.
2. Orquestador selecciona candidato por capability.
3. Agente ejecuta y devuelve resultado MCP.
4. Orquestador calcula reward/penalty.
5. Agente muta rasgos y actualiza score.

## Contratos incluidos en codigo

- message envelope: src/mcp_multiagent/protocol.py
- agent base + mutation: src/mcp_multiagent/agent_base.py
- orchestrator: src/mcp_multiagent/orchestrator.py
- demo runner: src/mcp_multiagent/main.py

## Implementado en fase actual

1. Transporte MCP real:
- stdio con `src/mcp_multiagent/transport_stdio.py`
- HTTP con `src/mcp_multiagent/transport_http.py`

2. Orquestacion extendida:
- `PlannerAgent` y `CriticAgent` incorporados.
- score dinamico y mutacion por feedback.

3. Persistencia de estado mutante:
- SQLite por defecto (`SQLiteMutationStore`).
- PostgreSQL opcional (`PostgresMutationStore`).

4. Seguridad por tenant:
- Politicas de capabilities permitidas.
- Bloqueo selectivo por agente.

## Siguiente fase recomendada

1. Añadir bus de eventos para trazas y telemetria distribuida.
2. Implementar circuito de retries y dead-letter queue.
3. Integrar memoria semantica y cache de contexto por tenant.
