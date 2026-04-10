using Dune.Domain.Entities;
using Dune.Domain.Enums;
using Dune.Simulation.Services;
using Dune.Persistence.Services;
using Dune.Events.Logging;

namespace Dune.Client;

class Program
{
    static Partida? _partidaActual = null;
    static SimulationService? _simulationService;
    static PersistenceService? _persistenceService;
    static EventLog? _eventLog;

    static void Main(string[] args)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        MostrarBienvenida();

        // Inicializar servicios
        _simulationService = new SimulationService();
        _persistenceService = new PersistenceService();
        _eventLog = new EventLog();

        // Menú principal
        DesplegarMenuPrincipal();
    }

    static void MostrarBienvenida()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("╔════════════════════════════════════════════════════════════╗");
        Console.WriteLine("║                                                            ║");
        Console.WriteLine("║     DUNE: ARRAKIS DOMINION DISTRIBUTED SYSTEM             ║");
        Console.WriteLine("║              Simulador de Ecosistema                      ║");
        Console.WriteLine("║                                                            ║");
        Console.WriteLine("╚════════════════════════════════════════════════════════════╝");
        Console.ResetColor();
        Console.WriteLine();
    }

    static void DesplegarMenuPrincipal()
    {
        bool continuar = true;

        while (continuar)
        {
            Console.WriteLine("\n┌─ MENÚ PRINCIPAL ─────────────────────────────────┐");
            Console.WriteLine("│ 1. Nueva Partida                                 │");
            Console.WriteLine("│ 2. Ver Estado de Partida                         │");
            Console.WriteLine("│ 3. Ejecutar Ronda                                │");
            Console.WriteLine("│ 4. Ver Eventos                                   │");
            Console.WriteLine("│ 5. Ver Criaturas                                 │");
            Console.WriteLine("│ 6. Ver Enclaves                                  │");
            Console.WriteLine("│ 7. Salir                                         │");
            Console.WriteLine("└──────────────────────────────────────────────────┘");
            Console.Write("\nSelecciona opción: ");

            string? opcion = Console.ReadLine();

            switch (opcion)
            {
                case "1":
                    CrearNuevaPartida();
                    break;
                case "2":
                    VerEstadoPartida();
                    break;
                case "3":
                    EjecutarRonda();
                    break;
                case "4":
                    VerEventos();
                    break;
                case "5":
                    VerCriaturas();
                    break;
                case "6":
                    VerEnclaves();
                    break;
                case "7":
                    continuar = false;
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("\n✓ ¡Gracias por jugar! Hasta pronto.");
                    Console.ResetColor();
                    break;
                default:
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("❌ Opción no válida");
                    Console.ResetColor();
                    break;
            }
        }
    }

    static void CrearNuevaPartida()
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("\n📋 CREANDO NUEVA PARTIDA...");
        Console.ResetColor();

        var partida = new Partida
        {
            Nombre = "Colonización de Arrakis",
            Descripcion = "Primera expedición a Arrakis",
            RondaActual = 0,
            Estado = "Activa",
            RecursosGlobales = 5000
        };

        // Crear enclave
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

        // Crear criaturas
        var gusano = new Criatura
        {
            Nombre = "Shai-Hulud #1",
            Salud = 100,
            Edad = 5,
            Energia = 90,
            Medio = Medio.DESIERTO,
            Alimentacion = Alimentacion.DEPREDADOR,
            IdEnclave = enclave.Id
        };

        var recolector = new Criatura
        {
            Nombre = "Recolector de Melange #1",
            Salud = 80,
            Edad = 2,
            Energia = 60,
            Medio = Medio.DESIERTO,
            Alimentacion = Alimentacion.RECOLECTOR,
            IdEnclave = enclave.Id
        };

        var pajaro = new Criatura
        {
            Nombre = "Águila de Arrakis #1",
            Salud = 70,
            Edad = 1,
            Energia = 75,
            Medio = Medio.AEREO,
            Alimentacion = Alimentacion.DEPREDADOR,
            IdEnclave = enclave.Id
        };

        partida.Criaturas.AddRange(new[] { gusano, recolector, pajaro });

        // Crear instalaciones
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

        partida.Instalaciones.AddRange(new[] { invernadero, almacen });

        _partidaActual = partida;

        // Registrar evento
        var evento = new EventoSistema
        {
            TipoEvento = "Sistema",
            Descripcion = "Nueva partida creada",
            Nivel = "Info",
            IdPartida = partida.Id,
            RondaAsociada = 0
        };
        _eventLog?.RegistrarEvento(evento);

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"\n✓ Partida creada: {partida.Nombre}");
        Console.WriteLine($"  ID: {partida.Id}");
        Console.WriteLine($"  Enclaves: {partida.Enclaves.Count}");
        Console.WriteLine($"  Criaturas: {partida.Criaturas.Count}");
        Console.WriteLine($"  Instalaciones: {partida.Instalaciones.Count}");
        Console.WriteLine($"  Recursos: {partida.RecursosGlobales}");
        Console.ResetColor();
    }

    static void VerEstadoPartida()
    {
        if (_partidaActual == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n❌ No hay partida activa. Crea una primero.");
            Console.ResetColor();
            return;
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("\n═══════════════════════════════════════════════════════");
        Console.WriteLine("               ESTADO DE LA PARTIDA");
        Console.WriteLine("═══════════════════════════════════════════════════════");
        Console.ResetColor();

        Console.WriteLine($"📜 Nombre:              {_partidaActual.Nombre}");
        Console.WriteLine($"📝 Descripción:         {_partidaActual.Descripcion}");
        Console.WriteLine($"🔢 Ronda Actual:        {_partidaActual.RondaActual}");
        Console.WriteLine($"🎮 Estado:              {_partidaActual.Estado}");
        Console.WriteLine($"💰 Recursos Globales:   {_partidaActual.RecursosGlobales}");
        Console.WriteLine($"📊 Recursos Consumidos: {_partidaActual.RecursosConsumidos}");
        Console.WriteLine();
        Console.WriteLine($"🏢 Enclaves:            {_partidaActual.Enclaves.Count}");
        Console.WriteLine($"🦀 Criaturas:           {_partidaActual.Criaturas.Count}");
        Console.WriteLine($"⚙️  Instalaciones:       {_partidaActual.Instalaciones.Count}");
        Console.WriteLine();
        Console.WriteLine($"⏰ Creada:               {_partidaActual.FechaCreacion:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine($"🔄 Última actualización: {_partidaActual.FechaActualizacion:yyyy-MM-dd HH:mm:ss}");
    }

    static void EjecutarRonda()
    {
        if (_partidaActual == null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n❌ No hay partida activa.");
            Console.ResetColor();
            return;
        }

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"\n🎮 Ejecutando Ronda {_partidaActual.RondaActual + 1}...");
        Console.ResetColor();

        _partidaActual.RondaActual++;
        _simulationService?.EjecutarRonda(_partidaActual);

        var evento = new EventoSistema
        {
            TipoEvento = "Simulación",
            Descripcion = $"Ronda {_partidaActual.RondaActual} completada",
            Nivel = "Info",
            IdPartida = _partidaActual.Id,
            RondaAsociada = _partidaActual.RondaActual,
            DatosAdicionales = $"{{\"criaturas\": {_partidaActual.Criaturas.Count}, \"recursos\": {_partidaActual.RecursosGlobales}}}"
        };
        _eventLog?.RegistrarEvento(evento);

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"✓ Ronda {_partidaActual.RondaActual} completada");
        Console.WriteLine($"  Criaturas: {_partidaActual.Criaturas.Count}");
        Console.WriteLine($"  Salud promedio: {_partidaActual.Criaturas.Average(c => c.Salud):F1}");
        Console.ResetColor();
    }

    static void VerEventos()
    {
        if (_eventLog == null)
        {
            Console.WriteLine("\n❌ Sistema de eventos no disponible.");
            return;
        }

        var eventos = _eventLog.ObtenerEventos();

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("\n═══════════════════════════════════════════════════════");
        Console.WriteLine($"                    EVENTOS ({eventos.Count})");
        Console.WriteLine("═══════════════════════════════════════════════════════");
        Console.ResetColor();

        if (eventos.Count == 0)
        {
            Console.WriteLine("ℹ️  No hay eventos registrados.");
            return;
        }

        foreach (var evento in eventos.TakeLast(10))
        {
            var color = evento.Nivel switch
            {
                "Error" => ConsoleColor.Red,
                "Warning" => ConsoleColor.Yellow,
                _ => ConsoleColor.White
            };

            Console.ForegroundColor = color;
            Console.WriteLine($"[{evento.Nivel}] {evento.TipoEvento}: {evento.Descripcion}");
            Console.ResetColor();
        }
    }

    static void VerCriaturas()
    {
        if (_partidaActual == null || _partidaActual.Criaturas.Count == 0)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n❌ No hay criaturas en la partida.");
            Console.ResetColor();
            return;
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"\n═══════════════════════════════════════════════════════");
        Console.WriteLine($"            CRIATURAS ({_partidaActual.Criaturas.Count})");
        Console.WriteLine("═══════════════════════════════════════════════════════");
        Console.ResetColor();

        foreach (var criatura in _partidaActual.Criaturas)
        {
            Console.WriteLine($"\n🦀 {criatura.Nombre}");
            Console.WriteLine($"   ID:           {criatura.Id}");
            Console.WriteLine($"   Salud:        {criatura.Salud}/100");
            Console.WriteLine($"   Edad:         {criatura.Edad} ciclos");
            Console.WriteLine($"   Energía:      {criatura.Energia}%");
            Console.WriteLine($"   Medio:        {criatura.Medio}");
            Console.WriteLine($"   Alimentación: {criatura.Alimentacion}");
            Console.WriteLine($"   Enclave:      {criatura.IdEnclave}");
        }
    }

    static void VerEnclaves()
    {
        if (_partidaActual == null || _partidaActual.Enclaves.Count == 0)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("\n❌ No hay enclaves en la partida.");
            Console.ResetColor();
            return;
        }

        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"\n═══════════════════════════════════════════════════════");
        Console.WriteLine($"             ENCLAVES ({_partidaActual.Enclaves.Count})");
        Console.WriteLine("═══════════════════════════════════════════════════════");
        Console.ResetColor();

        foreach (var enclave in _partidaActual.Enclaves)
        {
            var criaturas = _partidaActual.Criaturas.Count(c => c.IdEnclave == enclave.Id);
            var instalaciones = _partidaActual.Instalaciones.Count(i => i.IdEnclave == enclave.Id);

            Console.WriteLine($"\n🏢 {enclave.Nombre}");
            Console.WriteLine($"   ID:              {enclave.Id}");
            Console.WriteLine($"   Descripción:     {enclave.Descripcion}");
            Console.WriteLine($"   Coordenadas:     ({enclave.CoordenadaX}, {enclave.CoordenadaY})");
            Console.WriteLine($"   Recursos:        {enclave.Recursos}");
            Console.WriteLine($"   Capacidad:       {criaturas}/{enclave.CapacidadMaxima}");
            Console.WriteLine($"   Criaturas:       {criaturas}");
            Console.WriteLine($"   Instalaciones:   {instalaciones}");
        }
    }
}
