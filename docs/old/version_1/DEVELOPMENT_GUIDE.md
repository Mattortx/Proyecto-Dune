# GUÍA DE DESARROLLO - Dune: Arrakis Dominion Distributed System

## Convenciones de Código

### Naming Conventions

```csharp
// Classes: PascalCase
public class Criatura { }

// Methods: PascalCase
public void EjecutarRonda() { }

// Properties: PascalCase
public string Nombre { get; set; }

// Private fields: _camelCase
private List<Criatura> _criaturas = new();

// Constants: UPPER_SNAKE_CASE
private const int ENERGIA_MAXIMA = 100;

// Parameters: camelCase
public void Mover(int distancia, Medio medio) { }
```

### Documentation Standards

```csharp
/// <summary>
/// Descripción breve del método (una línea)
/// </summary>
/// <param name="partida">Descripción del parámetro</param>
/// <remarks>
/// Notas adicionales si es necesario
/// </remarks>
public void EjecutarRonda(Partida partida) { }
```

## Estructura de Paquetes

### Dune.Domain (Núcleo)
- **NO importar** de otros proyectos
- **SÍ contiene** modelos puros de negocio
- **Responsabilidad**: Definir el lenguaje de dominio

### Dune.Events
- **SÍ importa** Dune.Domain
- **NO importa** Persistence, Simulation, Client
- **Responsabilidad**: Auditoría y trazabilidad

### Dune.Persistence
- **SÍ importa** Dune.Domain, Dune.Events
- **NO importa** Simulation, Client
- **Responsabilidad**: Acceso a datos

### Dune.Simulation
- **SÍ importa** Dune.Domain, Dune.Events
- **NO importa** Persistence (inyectable), Client
- **Responsabilidad**: Lógica de negocio de simulación

### Dune.Client
- **SÍ importa** Todo (dependencia de presentación)
- **Responsabilidad**: Interfaz con usuario

## Patrones de Implementación

### Services Pattern

```csharp
public class MiService
{
    private readonly EventLog _eventLog;
    
    public MiService(EventLog eventLog)
    {
        _eventLog = eventLog;
    }
    
    public void EjecutarOperacion()
    {
        // Implementar lógica
        _eventLog.RegistrarEvento(new EventoSistema 
        { 
            TipoEvento = "Operacion",
            Descripcion = "..."
        });
    }
}
```

### Entity Pattern

```csharp
public class MiEntidad
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    
    public MiEntidad()
    {
        Id = Guid.NewGuid();
        FechaCreacion = DateTime.UtcNow;
    }
}
```

## Testing Guidelines (Para futuro)

```csharp
[TestClass]
public class SimulationServiceTests
{
    private SimulationService _service;
    
    [TestInitialize]
    public void Setup()
    {
        _service = new SimulationService();
    }
    
    [TestMethod]
    public void EjecutarRonda_DeberiaIncrementarRondaActual()
    {
        // Arrange
        var partida = new Partida { RondaActual = 1 };
        
        // Act
        _service.EjecutarRonda(partida);
        
        // Assert
        Assert.AreEqual(2, partida.RondaActual);
    }
}
```

## Próximas Fases de Implementación

### Fase 1: Core Logic (Actual)
✅ Estructura de carpetas
✅ Entidades base
✅ Servicios shell
⏳ Lógica de simulación completa

### Fase 2: Persistencia
- Implementar JSON serialization completa
- Manejo de errores y validaciones
- Backups automáticos

### Fase 3: Interfaz Cliente
- Menú interactivo robusto
- Visualización de estado
- Entrada de usuario validada

### Fase 4: Distribución
- Inyección de dependencias
- Interfaces abstractas
- Preparación para gRPC/APIs

### Fase 5: Escalabilidad
- Entity Framework Core
- Message Queue Integration
- Microservicios independientes

## Checklist de Calidad

- [ ] Código compila sin errores
- [ ] Todas las clases tienen documentación XML
- [ ] No hay warnings
- [ ] Cumple convenciones de naming
- [ ] Sin acoplamiento entre capas
- [ ] Métodos públicos tienen propósito claro
- [ ] Guids usados para identificadores globales
- [ ] Timestamps en UTC

## Recursos Útiles

- [Microsoft C# Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [System.Text.Json Documentation](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json)

