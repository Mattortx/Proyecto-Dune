namespace Dune.Domain.Entities;

/// <summary>
/// Entidad que representa un enclave o colonia en Arrakis
/// </summary>
public class Enclave
{
    /// <summary>Identificador único del enclave</summary>
    public Guid Id { get; set; }

    /// <summary>Nombre del enclave</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Descripción del enclave</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Recursos disponibles en el enclave</summary>
    public int Recursos { get; set; }

    /// <summary>Coordinada X en el mapa</summary>
    public double CoordenadaX { get; set; }

    /// <summary>Coordinada Y en el mapa</summary>
    public double CoordenadaY { get; set; }

    /// <summary>Capacidad máxima de criaturas</summary>
    public int CapacidadMaxima { get; set; }

    /// <summary>Criaturas que habitan el enclave</summary>
    public List<Guid> IdsCriaturas { get; set; } = new();

    /// <summary>Timestamp de creación</summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>Timestamp de última actualización</summary>
    public DateTime FechaActualizacion { get; set; }

    public Enclave()
    {
        Id = Guid.NewGuid();
        FechaCreacion = DateTime.UtcNow;
        FechaActualizacion = DateTime.UtcNow;
    }
}
