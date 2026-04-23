# Spec-Driven Development

Este directorio centraliza las especificaciones antes de implementar cambios en código.

## Flujo recomendado

1. Define el problema con una frase concreta.
2. Escribe una spec con alcance, no-objetivos y criterios de aceptación.
3. Divide la entrega en fases pequeñas.
4. Implementa solo lo que la spec autoriza.
5. Valida con pruebas o checklist.
6. Cierra la spec con resultados y pendientes.

## Estructura de una spec

- Contexto
- Objetivo
- Alcance
- No objetivos
- Requisitos funcionales
- Requisitos no funcionales
- Modelo de datos o contratos
- Casos de uso
- Criterios de aceptación
- Plan de pruebas
- Riesgos
- Rollout
- Estado

## Reglas

- Una spec debe poder leerse sin abrir el código.
- Si cambia el alcance, se actualiza la spec primero.
- Si una decisión afecta datos o interfaz, se deja reflejada en la spec.
- Una tarea grande debe partirse en varias specs pequeñas.
