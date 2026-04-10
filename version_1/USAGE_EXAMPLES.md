# EJEMPLOS DE USO - DUNE System

## Creación de Entidades

### Crear una Partida

```csharp
// Crear nueva partida
var partida = new Partida
{
    Nombre = "Colonización Inicial",
    Descripcion = "Primera expedición a Arrakis",
    RondaActual = 0,
    Estado = "Activa",
    RecursosGlobales = 5000
};

Console.WriteLine($"Partida creada: {partida.Id}");
Console.WriteLine($"Nombre: {partida.Nombre}");
```

### Crear Criaturas

```csharp
// Gusano de arena
var gusano = new Criatura
{
    Nombre = "Shai-Hulud",
    Salud = 100,
    Edad = 0,
    Energia = 95,
    Medio = Medio.DESIERTO,
    Alimentacion = Alimentacion.DEPREDADOR,
    IdEnclave = enclave.Id
};

// Spice harvester
var recolector = new Criatura
{
    Nombre = "Recolector #1",
    Salud = 80,
    Edad = 2,
    Energia = 60,
    Medio = Medio.DESIERTO,
    Alimentacion = Alimentacion.RECOLECTOR,
    IdEnclave = enclave.Id
};

partida.Criaturas.Add(gusano);
partida.Criaturas.Add(recolector);
```

### Crear Enclaves

```csharp
var enclave = new Enclave
{
    Nombre = "Arrakeen Principal",
    Descripcion = "Centro de operaciones principales",
    Recursos = 1000,
    CoordenadaX = 0.0,
    CoordenadaY = 0.0,
    CapacidadMaxima = 100
};

partida.Enclaves.Add(enclave);
```

### Crear Instalaciones

```csharp
var invernadero = new Instalacion
{
    Nombre = "Invernadero Hidropónico",
    Tipo = "Invernadero",
    IdEnclave = enclave.Id,
    Eficiencia = 85,
    ProduccionPorRonda = 50,
    ConsumosPorRonda = 10,
    Activa = true
};

var almacen = new Instalacion
{
    Nombre = "Almacén de Recursos",
    Tipo = "Almacén",
    IdEnclave = enclave.Id,
    Eficiencia = 100,
    ProduccionPorRonda = 0,
    ConsumosPorRonda = 5,
    Activa = true
};

partida.Instalaciones.Add(invernadero);
partida.Instalaciones.Add(almacen);
```

---

## Uso de Servicios

### SimulationService

```csharp
var simulationService = new SimulationService();

// Ejecutar una ronda
simulationService.EjecutarRonda(partida);
partida.RondaActual++;

// Ejecutar múltiples rondas
for (int i = 0; i < 10; i++)
{
    simulationService.EjecutarRonda(partida);
    partida.RondaActual++;
    Console.WriteLine($"Ronda {partida.RondaActual} completada");
}
```

### PersistenceService

```csharp
var persistenceService = new PersistenceService("./Partidas");

// Guardar partida
await persistenceService.GuardarPartida(partida);
Console.WriteLine("Partida guardada exitosamente");

// Cargar partida
var partidaCargada = await persistenceService.CargarPartida(partida.Id);
if (partidaCargada != null)
{
    Console.WriteLine($"Partida cargada: {partidaCargada.Nombre}");
    Console.WriteLine($"Ronda actual: {partidaCargada.RondaActual}");
}

// Listar partidas guardadas
var partidasGuardadas = await persistenceService.ObtenerPartidasGuardadas();
Console.WriteLine($"Total de partidas: {partidasGuardadas.Count}");

// Exportar a backup
await persistenceService.ExportarPartida(partida, "./Backups/partida_v1.json");
```

### EventLog

```csharp
var eventLog = new EventLog();

// Registrar un evento
var evento = new EventoSistema
{
    TipoEvento = "Simulación",
    Descripcion = "Ronda 1 completada exitosamente",
    Nivel = "Info",
    IdPartida = partida.Id,
    RondaAsociada = 1,
    DatosAdicionales = "{\"criturasMuertas\": 0, \"energiaGenerada\": 500}"
};

eventLog.RegistrarEvento(evento);
Console.WriteLine("Evento registrado");

// Obtener eventos
var todosEventos = eventLog.ObtenerEventos();
Console.WriteLine($"Total de eventos: {todosEventos.Count}");

// Filtrar por tipo
var eventosSimulacion = eventLog.ObtenerEventosPorTipo("Simulación");
foreach (var ev in eventosSimulacion)
{
    Console.WriteLine($"[{ev.Nivel}] {ev.Descripcion}");
}

// Filtrar por partida
var eventosPartida = eventLog.ObtenerEventosPorPartida(partida.Id);
Console.WriteLine($"Eventos de esta partida: {eventosPartida.Count()}");

// Limpiar eventos antiguos (más de 7 días)
eventLog.LimpiarEventosAntiguos(TimeSpan.FromDays(7));
```

---

## Flujo Completo de Uso

```csharp
using Dune.Domain.Entities;
using Dune.Simulation.Services;
using Dune.Persistence.Services;
using Dune.Events.Logging;

class Program
{
    static async Task Main(string[] args)
    {
        // SETUP
        var partida = CrearPartidaInicial();
        var simulationService = new SimulationService();
        var persistenceService = new PersistenceService();
        var eventLog = new EventLog();

        Console.WriteLine("=== DUNE SIMULATOR ===\n");

        // SIMULACIÓN
        for (int ronda = 1; ronda <= 5; ronda++)
        {
            Console.WriteLine($"\n--- Ronda {ronda} ---");
            
            // Ejecutar lógica
            simulationService.EjecutarRonda(partida);
            partida.RondaActual = ronda;
            
            // Registrar evento
            LogRonda(eventLog, partida, ronda);
            
            // Mostrar estado
            MostrarEstadoPartida(partida);
            
            // Guardar (cada 5 rondas)
            if (ronda % 5 == 0)
            {
                await persistenceService.GuardarPartida(partida);
                Console.WriteLine($"\n✓ Partida guardada en ronda {ronda}");
            }
        }

        // REPORTES FINALES
        Console.WriteLine("\n=== REPORTES FINALES ===");
        ReportarEventos(eventLog);
        ReportarEstadisticas(partida);

        // GUARDAR ESTADO FINAL
        await persistenceService.GuardarPartida(partida);
        Console.WriteLine("\n✓ Simulación completada y guardada");
    }

    static Partida CrearPartidaInicial()
    {
        var partida = new Partida
        {
            Nombre = "Simulación Principal",
            RecursosGlobales = 10000
        };

        // Crear enclave
        var enclave = new Enclave
        {
            Nombre = "Arrakeen",
            CoordenadaX = 0,
            CoordenadaY = 0,
            CapacidadMaxima = 50,
            Recursos = 1000
        };
        partida.Enclaves.Add(enclave);

        // Crear criaturas
        var gusano = new Criatura
        {
            Nombre = "Shai-Hulud #1",
            Salud = 100,
            Energia = 90,
            Medio = Medio.DESIERTO,
            Alimentacion = Alimentacion.DEPREDADOR,
            IdEnclave = enclave.Id
        };
        partida.Criaturas.Add(gusano);

        return partida;
    }

    static void LogRonda(EventLog log, Partida partida, int ronda)
    {
        var evento = new EventoSistema
        {
            TipoEvento = "Simulación",
            Descripcion = $"Ronda {ronda} completada",
            Nivel = "Info",
            IdPartida = partida.Id,
            RondaAsociada = ronda
        };
        log.RegistrarEvento(evento);
    }

    static void MostrarEstadoPartida(Partida partida)
    {
        Console.WriteLine($"Ronda: {partida.RondaActual}");
        Console.WriteLine($"Criaturas: {partida.Criaturas.Count}");
        Console.WriteLine($"Recursos: {partida.RecursosGlobales}");
    }

    static void ReportarEventos(EventLog log)
    {
        var eventos = log.ObtenerEventos();
        Console.WriteLine($"Eventos totales: {eventos.Count}");
        foreach (var ev in eventos.Take(5))
        {
            Console.WriteLine($"  - [{ev.Nivel}] {ev.Descripcion}");
        }
    }

    static void ReportarEstadisticas(Partida partida)
    {
        Console.WriteLine($"Rondas jugadas: {partida.RondaActual}");
        Console.WriteLine($"Criaturas finales: {partida.Criaturas.Count}");
        Console.WriteLine($"Salud promedio: {partida.Criaturas.Average(c => c.Salud):F1}");
    }
}
```

---

## Patrones Comunes

### Validar Estado de Partida

```csharp
bool ValidarPartida(Partida partida)
{
    // Verificar que existe al menos un enclave
    if (!partida.Enclaves.Any())
    {
        Console.WriteLine("Error: No hay enclaves en la partida");
        return false;
    }

    // Verificar que hay criaturas
    if (!partida.Criaturas.Any())
    {
        Console.WriteLine("Error: No hay criaturas en la partida");
        return false;
    }

    // Verificar que no hay referencias rotas
    foreach (var criatura in partida.Criaturas)
    {
        if (!partida.Enclaves.Any(e => e.Id == criatura.IdEnclave))
        {
            Console.WriteLine($"Error: Criatura {criatura.Id} referencia enclave inexistente");
            return false;
        }
    }

    return true;
}
```

### Filtrar Criaturas por Tipo

```csharp
// Obtener todos los depredadores
var depredadores = partida.Criaturas
    .Where(c => c.Alimentacion == Alimentacion.DEPREDADOR)
    .ToList();

// Obtener criaturas débiles
var criaturasDebiles = partida.Criaturas
    .Where(c => c.Salud < 50)
    .OrderByDescending(c => c.Salud)
    .ToList();

// Agrupar por medio
var porMedio = partida.Criaturas
    .GroupBy(c => c.Medio)
    .ToDictionary(g => g.Key, g => g.Count());
```

### Agregar Criatura a Enclave

```csharp
void AgregarCriaturaAEnclave(Partida partida, Criatura criatura, Enclave enclave)
{
    if (enclave.IdsCriaturas.Count >= enclave.CapacidadMaxima)
    {
        throw new InvalidOperationException("Enclave está a capacidad máxima");
    }

    criatura.IdEnclave = enclave.Id;
    enclave.IdsCriaturas.Add(criatura.Id);
    
    if (!partida.Criaturas.Any(c => c.Id == criatura.Id))
    {
        partida.Criaturas.Add(criatura);
    }
}
```

---

## Notas Importantes

- Todos los métodos de Persistence son `async` (listos para I/O)
- Los Ids de Guid garantizan no colisiones globales
- Los timestamps siempre son UTC para sincronización
- Los métodos de Simulation aún no tienen lógica (implementar en Phase 2)
- El EventLog almacena en memoria (upgrade a BD fácil)

