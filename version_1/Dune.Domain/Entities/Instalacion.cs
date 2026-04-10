namespace Dune.Domain.Entities;

/// <summary>
/// Entidad que representa una instalación o estructura en un enclave
/// </summary>
public class Instalacion
{
    /// <summary>Identificador único de la instalación</summary>
    public Guid Id { get; set; }

    /// <summary>Nombre de la instalación</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Tipo de instalación (ej: Invernadero, Almacén, Laboratorio)</summary>
    public string Tipo { get; set; } = string.Empty;

    /// <summary>Identificador del enclave al que pertenece</summary>
    public Guid IdEnclave { get; set; }

    /// <summary>Nivel de eficiencia (0-100)</summary>
    public int Eficiencia { get; set; }

    /// <summary>Recursos que produce por ronda</summary>
    public int ProduccionPorRonda { get; set; }

    /// <summary>Recursos consumidos por ronda</summary>
    public int ConsumosPorRonda { get; set; }

    /// <summary>Indica si la instalación está activa</summary>
    public bool Activa { get; set; }

    /// <summary>Timestamp de creación</summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>Timestamp de última actualización</summary>
    public DateTime FechaActualizacion { get; set; }

    public Instalacion()
    {
        Id = Guid.NewGuid();
        FechaCreacion = DateTime.UtcNow;
        FechaActualizacion = DateTime.UtcNow;
    }
}
