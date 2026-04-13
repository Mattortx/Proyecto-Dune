# DUNE: Arrakis Dominion Distributed System

## Descripción General

Sistema de simulación distribuida para un ecosistema complejo en el planeta Arrakis (del universo de Dune). Arquitectura basada en capas con separación clara de responsabilidades, diseñada para simular comunidades, criaturas, enclaves e instalaciones.

## Requisitos

- .NET 8.0 o superior
- Visual Studio 2022 / VS Code
- Git

## Estructura del Proyecto

```
Dune.sln                          # Solución principal
├── Dune.Domain                   # Capa de Dominio (Entidades, Enums)
│   ├── Entities/                 # Modelos de dominio
│   │   ├── Partida.cs
│   │   ├── Criatura.cs
│   │   ├── Enclave.cs
│   │   └── Instalacion.cs
│   └── Enums/                    # Enumeraciones
│       ├── Medio.cs
│       └── Alimentacion.cs
│
├── Dune.Events                   # Capa de Eventos (Logging, Auditoría)
│   └── Logging/
│       └── EventLog.cs          # Sistema de eventos y logging
│
├── Dune.Persistence              # Capa de Persistencia (Datos)
│   └── Services/
│       └── PersistenceService.cs # Guardado/Carga JSON
│
├── Dune.Simulation               # Capa de Lógica de Negocio
│   └── Services/
│       └── SimulationService.cs  # Simulación de rondas
│
└── Dune.Client                   # Capa de Presentación (Consola)
    └── Program.cs               # Interfaz con usuario
```

## Características Clave

### Capa Domain (Dune.Domain)
- **Entities**: Partida, Criatura, Enclave, Instalacion
- **Enums**: Medio (DESIERTO, AEREO, SUBTERRANEO), Alimentacion (DEPREDADOR, RECOLECTOR)
- Sin dependencias externas (core business logic)

### Capa Events (Dune.Events)
- **EventLog**: Sistema centralizado de logging de eventos
- Auditoría de todas las operaciones del sistema
- Trazabilidad distribuida

### Capa Persistence (Dune.Persistence)
- **PersistenceService**: Manejo de persistencia en disco
- Usa `System.Text.Json` para serialización
- Rutas configurables
- Soporte para guardar/cargar y backup

### Capa Simulation (Dune.Simulation)
- **SimulationService**: Ejecuta la lógica de cada ronda
- Envejecimiento de criaturas
- Cambios de salud y energía
- Dinámicas de alimentación
- Actualización de enclaves

### Capa Client (Dune.Client)
- Interfaz de usuario en consola
- Menú interactivo
- Ejecutar rondas
- Ver estado de partida
- Guardar/Cargar juego

## Arquitectura Distribuida (Preparación)

La arquitectura está preparada para implementación distribuida:
- **Event Log Centralizado**: Ready para publicar a broker de mensajes (RabbitMQ, Kafka)
- **PersistenceService**: Fácilmente reemplazable por base de datos (Entity Framework)
- **Separation of Concerns**: Cada capa puede correr como microservicio independiente
- **GUIDs**: Todos los IDs son globales para sincronización distribuida

## Próximos Pasos

1. Implementar lógica de `SimulationService.EjecutarRonda()`
2. Implementar serialización JSON en `PersistenceService`
3. Completar menú interactivo en `Dune.Client`
4. Añadir validaciones y excepciones personalizadas
5. Implementar patrón Repository (para distribuido)
6. Añadir DTO (Data Transfer Objects) para comunicación remota

## Compilación

```bash
dotnet build
```

## Ejecución

```bash
cd Dune.Client
dotnet run
```

## Notas Arquitectónicas

- **No hay acoplamiento**: Domain no conoce de Persistence, Simulation, o Events
- **Inversión de dependencias**: Las capas superiores dependen de las inferiores
- **Principio SOLID**: Preparado para inyección de dependencias
- **Clean Code**: Documentación XML, nombres claros, métodos pequeños

---

**Autor**: Arquitecto Senior C# .NET  
**Versión**: 1.0 - Base Structure  
**Última actualización**: 2026-04-10
