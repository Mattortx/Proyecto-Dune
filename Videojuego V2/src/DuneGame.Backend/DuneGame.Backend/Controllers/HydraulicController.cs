using Microsoft.AspNetCore.Mvc;
using DuneGame.Backend.Application.Interfaces;
using DuneGame.Backend.Domain.Models;

namespace DuneGame.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HydraulicController : ControllerBase
{
    #region Campos Privados

    private readonly IHydraulicGameService _game;

    #endregion

    #region Constructor

    public HydraulicController(IHydraulicGameService game)
    {
        _game = game;
    }

    #endregion

    #region Endpoints GET - Consulta de Estado

    [HttpGet("config")]
    public IActionResult GetConfig() => Ok(_game.GetConfig());

    [HttpGet("state")]
    public IActionResult GetState() => Ok(_game.GetCurrentState());

    [HttpGet("resources")]
    public IActionResult GetResources() => Ok(_game.GetResources());

    [HttpGet("population")]
    public IActionResult GetPopulation() => Ok(_game.GetPopulation());

    [HttpGet("family")]
    public IActionResult GetFamily() => Ok(_game.GetFamily());

    [HttpGet("government")]
    public IActionResult GetGovernment() => Ok(_game.GetGovernment());

    [HttpGet("army")]
    public IActionResult GetArmy() => Ok(_game.GetArmy());

    [HttpGet("diplomacy")]
    public IActionResult GetDiplomacy() => Ok(_game.GetDiplomacy());

    [HttpGet("events")]
    public IActionResult GetEvents() => Ok(_game.GetEvents());

    [HttpGet("palace")]
    public IActionResult GetPalace() => Ok(_game.GetPalace());

    [HttpGet("buildings")]
    public IActionResult GetBuildings() => Ok(_game.GetBuildings());

    [HttpGet("districts")]
    public IActionResult GetDistricts() => Ok(_game.GetDistricts());

    #endregion

    #region Endpoints POST - Acciones

    [HttpPost("build")]
    public IActionResult Build([FromBody] BuildRequest request)
    {
        var success = _game.Build(request.BuildingId);
        return success 
            ? Ok(new { success = true }) 
            : BadRequest(new { success = false, message = "Recursos insuficientes" });
    }

    [HttpPost("event/choice")]
    public IActionResult ProcessEventChoice([FromBody] EventChoiceRequest request)
    {
        var success = _game.ProcessEventChoice(request.EventId, request.ChoiceId);
        return success 
            ? Ok(new { success = true }) 
            : BadRequest(new { success = false, message = "Selección inválida" });
    }

    [HttpPost("tick")]
    public IActionResult Tick()
    {
        _game.Tick();
        return Ok(_game.GetCurrentState());
    }

    #endregion
}

#region Modelos de Solicitud

public class BuildRequest
{
    public string BuildingId { get; set; } = string.Empty;
}

public class EventChoiceRequest
{
    public string EventId { get; set; } = string.Empty;
    public string ChoiceId { get; set; } = string.Empty;
}

#endregion