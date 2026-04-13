⚡ QUICK START GUIDE
====================

## Antes de Comenzar

1. **Asegurar que tienes .NET 8.0 instalado:**
   ```
   dotnet --version
   ```

2. **Navegar a la carpeta del proyecto:**
   ```
   cd Proyecto-Dune
   ```

## Compilar la Solución

```bash
# Restaurar dependencias
dotnet restore

# Compilar (Debug)
dotnet build

# Compilar (Release - optimizado)
dotnet build --configuration Release
```

## Ejecutar el Programa

```bash
cd Dune.Client
dotnet run
```

## Archivos Importantes a Revisar

### 📖 Documentación (Empieza aquí!)
1. **[README.md](README.md)** - Descripción general → ⭐ START HERE
2. **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Resumen ejecutivo
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura detallada

### 📚 Documentación Técnica
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - Diagramas ASCII y patrones
- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Guía para desarrolladores
- **[USAGE_EXAMPLES.md](USAGE_EXAMPLES.md)** - Ejemplos de código

### ✅ Validación
- **[CHECKLIST_VALIDATION.md](CHECKLIST_VALIDATION.md)** - Lista de validación
- **[STRUCTURE_SUMMARY.md](STRUCTURE_SUMMARY.md)** - Resumen de estructura

## Estructura del Proyecto

```
Dune.sln                          ← Solución principal
├── Dune.Domain/                  ← Modelos de negocio
│   ├── Entities/                 ← Partida, Criatura, Enclave, Instalacion
│   └── Enums/                    ← Medio, Alimentacion
├── Dune.Events/                  ← Sistema de auditoría
│   └── Logging/                  ← EventLog
├── Dune.Persistence/             ← Persistencia de datos
│   └── Services/                 ← PersistenceService
├── Dune.Simulation/              ← Lógica de simulación
│   └── Services/                 ← SimulationService
└── Dune.Client/                  ← Interfaz de usuario
    └── Program.cs                ← Punto de entrada
```

## Comandos Útiles

```bash
# Limpiar compilaciones anteriores
dotnet clean

# Construir solución completa
dotnet build

# Compilar en Release (optimizado)
dotnet build --configuration Release

# Ejecutar tests (cuando se implementen)
dotnet test

# Ver información de solución
dotnet sln list

# Listar proyectos
dotnet sln Dune.sln list
```

## Dependencias Entre Proyectos

```
Domain (Foundation - No imports)
    ↓
    ├─→ Events
    ├─→ Persistence
    ├─→ Simulation
    └─→ Client
```

## Estado Actual

✅ **Estructura base completada**
✅ **Entidades implementadas**
✅ **Servicios shell creados**
✅ **Compilable sin errores**
✅ **Documentación completa**

⏳ **Próxima fase**: Implementar lógica de SimulationService

## Estructura de la Solución (5 Capas)

```
┌─────────────┐
│   Client    │  Console App - Interfaz de usuario
├─────────────┤
│Simulation   │  Lógica de negocio de simulación
│   Events    │  Auditoría y logging centralizado
├─────────────┤
│Persistence  │  Acceso a datos (JSON/DB)
├─────────────┤
│   Domain    │  Modelos puros de negocio
└─────────────┘
```

## Entidades Principales

- **Partida**: Contenedor raíz de la simulación
- **Criatura**: Unidades de vida del ecosistema
- **Enclave**: Centros de operación/colonización
- **Instalacion**: Infraestructuras dentro de enclaves

## Enumeraciones

```csharp
Medio:         DESIERTO, AEREO, SUBTERRANEO
Alimentacion:  DEPREDADOR, RECOLECTOR
```

## Servicios

### SimulationService
- EjecutarRonda()
- EnvejecerCriaturas()
- ActualizarSalud()
- ProcesarAlimentacion()
- ActualizarEnclaves()
- ValidarEstadoPartida()

### PersistenceService
- GuardarPartida()
- CargarPartida()
- ObtenerPartidasGuardadas()
- EliminarPartida()
- ExportarPartida()

### EventLog
- RegistrarEvento()
- ObtenerEventos()
- ObtenerEventosPorTipo()
- ObtenerEventosPorPartida()
- LimpiarEventosAntiguos()
- ObtenerConteoTotal()

## Siguientes Pasos

1. 📖 Lee **ARCHITECTURE.md** para entender la estructura
2. 💻 Revisa los archivos en `Dune.Domain/Entities/` para ver las entidades
3. 📝 Consulta **USAGE_EXAMPLES.md** para ver cómo usar las clases
4. 🔨 Implementa la lógica en `SimulationService`
5. 💾 Implementa persistencia JSON en `PersistenceService`
6. 🎮 Crea el menú interactivo en `Dune.Client`

## Troubleshooting

**Error: ".NET 8.0 not found"**
→ Descargar desde https://dotnet.microsoft.com/download/dotnet/8.0

**Error: "Project references cycle"**
→ Verificar que Domain no importa otros proyectos

**Error en compilación**
→ Ejecutar `dotnet clean && dotnet restore`

## Contacto / Preguntas

- Revisar la documentación en orden: README → ARCHITECTURE → DEVELOPMENT_GUIDE
- Todos los servicios tienen comments explicando qué implementar
- Ver USAGE_EXAMPLES.md para ejemplos de código

---

🚀 **¡Listo para empezar!**

Próximo paso recomendado: Lee [README.md](README.md)

