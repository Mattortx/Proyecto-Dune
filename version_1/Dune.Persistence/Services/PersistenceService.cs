namespace Dune.Persistence.Services;

using Dune.Domain.Entities;

/// <summary>
/// Servicio de persistencia para guardar y cargar partidas
/// Utiliza System.Text.Json para serialización
/// </summary>
public class PersistenceService
{
    private readonly string _rutaGuardado;

    public PersistenceService(string rutaGuardado = "./Partidas")
    {
        _rutaGuardado = rutaGuardado;
        CrearDirectorioSiNoExiste();
    }

    /// <summary>Guarda una partida completa en almacenamiento</summary>
    public async Task GuardarPartida(Partida partida)
    {
        // Placeholder: será implementado con JSON serialization
    }

    /// <summary>Carga una partida del almacenamiento</summary>
    public async Task<Partida?> CargarPartida(Guid idPartida)
    {
        // Placeholder: será implementado con JSON deserialization
        return null;
    }

    /// <summary>Obtiene lista de todas las partidas guardadas</summary>
    public async Task<List<Guid>> ObtenerPartidasGuardadas()
    {
        // Placeholder
        return new List<Guid>();
    }

    /// <summary>Elimina una partida guardada</summary>
    public async Task EliminarPartida(Guid idPartida)
    {
        // Placeholder
    }

    /// <summary>Exporta una partida en un backup</summary>
    public async Task ExportarPartida(Partida partida, string rutaDestino)
    {
        // Placeholder: para backups y exportación
    }

    private void CrearDirectorioSiNoExiste()
    {
        if (!Directory.Exists(_rutaGuardado))
        {
            Directory.CreateDirectory(_rutaGuardado);
        }
    }
}
