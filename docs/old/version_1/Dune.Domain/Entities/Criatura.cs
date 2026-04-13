namespace Dune.Domain.Entities;

/// <summary>
/// Entidad base para todas las criaturas del ecosistema de Arrakis
/// </summary>
public class Criatura
{
    /// <summary>Identificador único de la criatura</summary>
    public Guid Id { get; set; }

    /// <summary>Nombre o identificador de la criatura</summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Nivel de salud actual (0-100)</summary>
    public int Salud { get; set; }

    /// <summary>Edad de la criatura en ciclos/rondas</summary>
    public int Edad { get; set; }

    /// <summary>Energía disponible (afectada por alimentación)</summary>
    public int Energia { get; set; }

    /// <summary>Medio en el que habita la criatura</summary>
    public Enums.Medio Medio { get; set; }

    /// <summary>Tipo de alimentación de la criatura</summary>
    public Enums.Alimentacion Alimentacion { get; set; }

    /// <summary>Identificador del enclave al que pertenece</summary>
    public Guid IdEnclave { get; set; }

    /// <summary>Timestamp de creación</summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>Timestamp de última actualización</summary>
    public DateTime FechaActualizacion { get; set; }

    public Criatura()
    {
        Id = Guid.NewGuid();
        FechaCreacion = DateTime.UtcNow;
        FechaActualizacion = DateTime.UtcNow;
    }
}
