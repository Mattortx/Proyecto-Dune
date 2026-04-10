# Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DUNE DISTRIBUTED SYSTEM                        │
│                    Arquitectura en Capas (Layered)                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                            │
│                      Dune.Client (Console App)                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Menu Principal:                                            │  │
│  │  • Ejecutar Ronda                                           │  │
│  │  • Ver Estado Partida                                       │  │
│  │  • Guardar / Cargar                                         │  │
│  │  • Salir                                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────┬─────────────────────────────────┬────────────────────┘
               │                                 │
               ▼                                 ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│   BUSINESS LOGIC LAYER       │  │    CROSS-CUTTING LAYER          │
│  Dune.Simulation             │  │    Dune.Events                  │
│  ┌──────────────────────────┐│  │  ┌────────────────────────────┐ │
│  │ SimulationService:       ││  │  │ EventLog:                  │ │
│  │ • EjecutarRonda()        ││  │  │ • RegistrarEvento()        │ │
│  │ • EnvejecerCriaturas()   ││  │  │ • ObtenerEventos()         │ │
│  │ • ActualizarSalud()      ││  │  │ • LimpiarAntiguos()        │ │
│  │ • ProcesarAlimentacion() ││  │  │ • ObtenerPorPartida()      │ │
│  │ • ActualizarEnclaves()   ││  │  │                            │ │
│  │ • ValidarEstado()        ││  │  │ EventoSistema:             │ │
│  └──────────────────────────┘│  │  │ • Id                       │ │
│                              │  │  │ • TipoEvento               │ │
│                              │  │  │ • Nivel                    │ │
│                              │  │  │ • IdPartida                │ │
│                              │  │  │ • FechaEvento              │ │
│                              │  │  └────────────────────────────┘ │
└────────────┬─────────────────────────┬────────────────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                               │
│                  Dune.Persistence (Class Library)                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ PersistenceService:                                        │  │
│  │ • GuardarPartida()                                         │  │
│  │ • CargarPartida()                                          │  │
│  │ • ObtenerPartidasGuardadas()                               │  │
│  │ • EliminarPartida()                                        │  │
│  │ • ExportarPartida()                                        │  │
│  │                                                            │  │
│  │ Usa: System.Text.Json                                     │  │
│  │ Ruta: ./Partidas/*.json                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────┐
│                   DOMAIN LAYER (Core)                              │
│                   Dune.Domain (Class Library)                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ENTITIES:           │  ENUMS:                              │  │
│  │ • Partida           │  • Medio                             │  │
│  │ • Criatura          │    - DESIERTO                        │  │
│  │ • Enclave           │    - AEREO                           │  │
│  │ • Instalacion       │    - SUBTERRANEO                     │  │
│  │                     │  • Alimentacion                      │  │
│  │ Pure Business Logic │    - DEPREDADOR                      │  │
│  │ No External Deps    │    - RECOLECTOR                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  STORAGE:  Disk (JSON Files) / Future: Database / Microservices   │
└────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                    DEPENDENCY FLOW (Unidirectional)
═══════════════════════════════════════════════════════════════════════

  Client ──→ Simulation ──┐
     │         │          │
     │         ▼          ▼
     └──→ Persistence ──→ Events
             │
             ▼
           Domain (Foundation - No dependencies)


═══════════════════════════════════════════════════════════════════════
                    DISTRIBUTED READINESS
═══════════════════════════════════════════════════════════════════════

Current State: LOCAL (All in single machine)
              ↓
Phase 2:      Event-based sharing (EventLog → Message Broker)
              ↓
Phase 3:      Separate Services (Simulation, Persistence as APIs)
              ↓
Phase 4:      Full Microservices (Independent deployments)


═══════════════════════════════════════════════════════════════════════
                      TECHNOLOGY STACK
═══════════════════════════════════════════════════════════════════════

Framework:    .NET 8.0
Language:     C# 12.0+ (Latest features)
Serialization: System.Text.Json (Built-in)
Nullability:  Enabled (Null-safe)
Async:        Prepared (PersistenceService ready async/await)

Future Additions:
• Entity Framework Core (Database)
• Dependency Injection (Microsoft.Extensions.DependencyInjection)
• Logging (Microsoft.Extensions.Logging)
• gRPC (Distributed Communication)
• RabbitMQ / Kafka (Message Bus)

```

## Patrones de Diseño Implementados

| Patrón | Ubicación | Propósito |
|--------|-----------|----------|
| **Layered Architecture** | Global | Separación de responsabilidades |
| **Repository Pattern** | (Ready) | Abstracción de acceso a datos |
| **Service Layer** | Simulation, Persistence | Lógica de negocio |
| **Event Sourcing** | Events | Auditoría y reproducibilidad |
| **Dependency Inversion** | (Ready) | Preparado para DI |
| **Immutable Config** | Domain | Entidades con valores fijos |

