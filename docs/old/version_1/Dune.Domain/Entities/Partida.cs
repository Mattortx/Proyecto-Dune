namespace Dune.Domain.Entities;

/// <summary>
/// Entidad raíz que representa una Partida completa del sistema
/// </summary>
public class Partida
{
    /// <summary>Identificador único de la partida</summary>
    public Guid Id { get; set; }

    /// <summary>Nombre de la partida</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Descripción de la partida</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Número de ronda actual</summary>
    public int RondaActual { get; set; }

    /// <summary>Enclaves existentes en la partida</summary>
    public List<Enclave> Enclaves { get; set; } = new();

    /// <summary>Criaturas existentes en la partida</summary>
    public List<Criatura> Criaturas { get; set; } = new();

    /// <summary>Instalaciones existentes en la partida</summary>
    public List<Instalacion> Instalaciones { get; set; } = new();

    /// <summary>Recursos globales del sistema</summary>
    public int RecursosGlobales { get; set; }

    /// <summary>Recursos consumidos totalmente</summary>
    public long RecursosConsumidos { get; set; }

    /// <summary>Estado de la partida (Activa, Pausada, Finalizada)</summary>
    public string Estado { get; set; } = "Activa";

    /// <summary>Timestamp de creación</summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>Timestamp de última actualización</summary>
    public DateTime FechaActualizacion { get; set; }

    public Partida()
    {
        Id = Guid.NewGuid();
        FechaCreacion = DateTime.UtcNow;
        FechaActualizacion = DateTime.UtcNow;
    }
}
