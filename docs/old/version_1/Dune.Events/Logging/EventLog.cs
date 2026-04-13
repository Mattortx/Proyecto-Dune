namespace Dune.Events.Logging;

/// <summary>
/// Representa un evento en el sistema para auditoría y trazabilidad
/// </summary>
public class EventoSistema
{
    /// <summary>Identificador único del evento</summary>
    public Guid Id { get; set; }

    /// <summary>Tipo de evento (Simulación, Persistencia, Sistema)</summary>
    public string TipoEvento { get; set; } = string.Empty;

    /// <summary>Descripción detallada del evento</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Nivel de severidad (Info, Warning, Error)</summary>
    public string Nivel { get; set; } = "Info";

    /// <summary>Identificador de la partida relacionada</summary>
    public Guid? IdPartida { get; set; }

    /// <summary>Número de ronda del evento</summary>
    public int RondaAsociada { get; set; }

    /// <summary>Datos adicionales en formato JSON</summary>
    public string DatosAdicionales { get; set; } = string.Empty;

    /// <summary>Timestamp del evento</summary>
    public DateTime FechaEvento { get; set; }

    public EventoSistema()
    {
        Id = Guid.NewGuid();
        FechaEvento = DateTime.UtcNow;
    }
}

/// <summary>
/// Servicio de logging de eventos del sistema distribuido
/// </summary>
public class EventLog
{
    private readonly List<EventoSistema> _eventos = new();

    /// <summary>Registra un nuevo evento en el log</summary>
    public void RegistrarEvento(EventoSistema evento)
    {
        _eventos.Add(evento);
    }

    /// <summary>Obtiene todos los eventos registrados</summary>
    public IReadOnlyList<EventoSistema> ObtenerEventos() => _eventos.AsReadOnly();

    /// <summary>Obtiene eventos por tipo</summary>
    public IEnumerable<EventoSistema> ObtenerEventosPorTipo(string tipo)
    {
        return _eventos.Where(e => e.TipoEvento == tipo);
    }

    /// <summary>Obtiene eventos por partida</summary>
    public IEnumerable<EventoSistema> ObtenerEventosPorPartida(Guid idPartida)
    {
        return _eventos.Where(e => e.IdPartida == idPartida);
    }

    /// <summary>Limpia los eventos antiguos (para evitar desbordamiento de memoria)</summary>
    public void LimpiarEventosAntiguos(TimeSpan antiguedad)
    {
        var limite = DateTime.UtcNow.Subtract(antiguedad);
        _eventos.RemoveAll(e => e.FechaEvento < limite);
    }

    /// <summary>Obtiene el conteo total de eventos</summary>
    public int ObtenerConteoTotal() => _eventos.Count;
}
