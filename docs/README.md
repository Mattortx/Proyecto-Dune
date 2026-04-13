# 🏜️ Proyecto-Dune - Repositorio Principal

## 📁 Estructura del Repositorio

```
Proyecto-Dune/
├── prueba/                    # Carpeta de pruebas y experimentos
│   └── d.unity               # Archivo de prueba
│
└── version 1/                # Versión 1.0 - Arquitectura Base
    ├── Dune.sln             # Solución .NET
    ├── Dune.Client/         # Interfaz de usuario (Console)
    ├── Dune.Domain/         # Modelos de negocio
    ├── Dune.Events/         # Sistema de logging
    ├── Dune.Persistence/    # Capa de datos
    ├── Dune.Simulation/     # Motor de simulación
    ├── .git/                # Control de versiones
    ├── .gitignore           # Configuración Git
    ├── README.md            # Documentación principal
    ├── START_HERE.md        # Guía de inicio rápido
    └── [Documentación completa...]
```

## 🎯 Versiones Disponibles

### 📦 Version 1 (Actual)
**Estado**: ✅ Completa - Arquitectura Base  
**Características**:
- Arquitectura en capas (5 capas)
- Sistema distribuido-ready
- Menú interactivo funcional
- Documentación completa
- Compilable y ejecutable

**Para ejecutar**:
```bash
cd "version 1/Dune.Client"
dotnet run
```

## 🚀 Próximas Versiones (Planificadas)

### Version 2
- Implementación completa de SimulationService
- Persistencia JSON funcional
- Tests unitarios

### Version 3
- Interfaz gráfica (WPF/WinForms)
- Base de datos (Entity Framework)
- Comunicación distribuida

### Version 4
- Microservicios
- API REST/gRPC
- Message Queue (RabbitMQ)

## 📚 Documentación

Toda la documentación está en `version 1/`:
- **[START_HERE.md](version%201/START_HERE.md)** - Inicio rápido
- **[README.md](version%201/README.md)** - Descripción completa
- **[ARCHITECTURE.md](version%201/ARCHITECTURE.md)** - Arquitectura técnica

## 🧪 Carpeta de Pruebas

La carpeta `prueba/` contiene experimentos y archivos de prueba que no forman parte del proyecto principal.

## 🔄 Control de Versiones

Cada versión mayor tendrá su propia carpeta (`version 1/`, `version 2/`, etc.) para mantener el historial completo del proyecto.

---

**Proyecto**: DUNE: Arrakis Dominion Distributed System  
**Última versión**: 1.0 - Arquitectura Base  
**Fecha**: 2026-04-10# 🏜️ DUNE: Arrakis Dominion Distributed System

> **Simulador de Ecosistema Distribuido** - Práctica de Arquitectura C# .NET

## 📋 Quick Start

### Requisitos Previos
- **.NET 8.0** o superior ([Descargar](https://dotnet.microsoft.com/download))
- **Git** (recomendado)
- Editor: Visual Studio 2022, VS Code, o Rider

### Instalación y Ejecución

```bash
# 1. Clonar o abrir el proyecto
cd Proyecto-Dune

# 2. Restaurar dependencias
dotnet restore

# 3. Compilar la solución
dotnet build

# 4. Ejecutar la aplicación cliente
cd Dune.Client
dotnet run
```

## 📂 Estructura del Proyecto

```
Dune.sln
├── Dune.Domain              ← Modelos de negocio (sin dependencias)
│   ├── Entities/
│   │   ├── Partida.cs
│   │   ├── Criatura.cs
│   │   ├── Enclave.cs
│   │   └── Instalacion.cs
│   └── Enums/
│       ├── Medio.cs
│       └── Alimentacion.cs
│
├── Dune.Events              ← Logging y auditoría distribuida
│   └── Logging/
│       └── EventLog.cs
│
├── Dune.Persistence         ← Capa de datos (JSON/Database)
│   └── Services/
│       └── PersistenceService.cs
│
├── Dune.Simulation          ← Motor de simulación
│   └── Services/
│       └── SimulationService.cs
│
└── Dune.Client              ← Interfaz de usuario (Consola)
    └── Program.cs
```

## 🏗️ Arquitectura

### Capas

| Capa | Descripción | Stack |
|------|-------------|-------|
| **Presentation** | Cliente consola | Dune.Client |
| **Business** | Lógica de simulación | Dune.Simulation |
| **Cross-Cutting** | Eventos y auditoría | Dune.Events |
| **Persistence** | Acceso a datos | Dune.Persistence |
| **Domain** | Modelos puros | Dune.Domain |

### Principios

✅ **Separación de responsabilidades**  
✅ **Arquitectura independiente de frameworks**  
✅ **Preparada para comunicación distribuida**  
✅ **SOLID principles**  
✅ **Clean Code**  

## 🔑 Entidades Principales

### Partida
Contenedor raíz de la simulación

```csharp
var partida = new Partida 
{ 
    Nombre = "Colonización de Arrakis",
    RondaActual = 0,
    Estado = "Activa"
};
```

### Criatura
Unidad de vida en el ecosistema

```csharp
var criatura = new Criatura 
{ 
    Nombre = "Gusano Arena #1",
    Salud = 100,
    Edad = 0,
    Energia = 80,
    Medio = Medio.DESIERTO,
    Alimentacion = Alimentacion.DEPREDADOR
};
```

### Enclave
Centro de operaciones/colonización

```csharp
var enclave = new Enclave 
{ 
    Nombre = "Arrakeen Principal",
    Recursos = 1000,
    CapacidadMaxima = 50
};
```

### Instalacion
Infraestructura dentro de un enclave

```csharp
var instalacion = new Instalacion 
{ 
    Nombre = "Invernadero Hidropónico",
    Tipo = "Invernadero",
    ProduccionPorRonda = 25,
    Activa = true
};
```

## 📊 Enumeraciones

```csharp
// Medio.cs
Medio.DESIERTO      // Arena
Medio.AEREO         // Cielos
Medio.SUBTERRANEO   // Cavernas

// Alimentacion.cs
Alimentacion.DEPREDADOR   // Carnívoro
Alimentacion.RECOLECTOR   // Herbívoro
```

## 🔄 Flujo de Simulación

```
┌─────────────────────────────────┐
│   Cliente solicita ronda        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ SimulationService.EjecutarRonda │
│ • Envejece criaturas            │
│ • Actualiza salud               │
│ • Procesa alimentación          │
│ • Actualiza enclaves            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  EventLog registra eventos      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Cliente muestra resultado        │
└─────────────────────────────────┘
```

## 📝 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Descripción detallada de la arquitectura
- [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Diagramas ASCII
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Guía de convenciones y patrones

## 🎯 Próximas Etapas

### Fase 1: Base (Completada ✅)
- [x] Estructura de proyectos
- [x] Entidades y enums
- [x] Servicios shell
- [x] Compilación exitosa

### Fase 2: Core Simulation
- [ ] Implementar lógica de `EjecutarRonda()`
- [ ] Envejecimiento de criaturas
- [ ] Dinámicas de alimentación
- [ ] Tests unitarios

### Fase 3: Persistencia Completa
- [ ] Serialización JSON con `System.Text.Json`
- [ ] Guardar/Cargar partidas
- [ ] Validaciones y manejo de errores
- [ ] Backups automáticos

### Fase 4: Cliente Interactivo
- [ ] Menú principal robusto
- [ ] Visualización de estado
- [ ] Entrada de usuario validada

### Fase 5: Preparación Distribuida
- [ ] Dependency Injection
- [ ] Interfaces abstractas
- [ ] Preparación para gRPC/APIs

## 🧪 Testing (Futuro)

```bash
dotnet test
```

## 🔗 Comunicación Distribuida (Roadmap)

La arquitectura está lista para evolucionar a:

- **RPC Local**: Diferentes procesos en la misma máquina
- **Microservicios**: Simulación y Persistencia como servicios independientes
- **Message Queue**: EventLog publicando a RabbitMQ/Kafka
- **Database**: Reemplazar JSON con Entity Framework + SQL Server
- **API Gateway**: Acceso remoto via gRPC/REST

## 📚 Recursos

- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/core/)
- [C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## 👥 Contribuciones

Esta es una práctica de arquitectura. Para contribuir:

1. Mantener las capas separadas
2. Seguir las convenciones en [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
3. Agregar documentación XML
4. Compilar sin warnings

## 📜 License

Educational Project - Free to use and modify

---

**Desarrollado como práctica de sistemas distribuidos en C# .NET**

🌐 *Preparado para evolucionar a arquitectura distribuida*
