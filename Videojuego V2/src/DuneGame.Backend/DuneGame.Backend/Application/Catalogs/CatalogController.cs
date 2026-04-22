using Microsoft.AspNetCore.Mvc;
using DuneGame.Backend.Application.Catalogs;
using DuneGame.Backend.Domain.Models;

namespace DuneGame.Backend.Application.Catalogs;

[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    [HttpGet("resources")]
    public IActionResult GetResources() =>
        Ok(ResourceCatalog.GetAll().Select(r => new
        {
            id = r.Id.ToString(),
            displayName = r.DisplayName,
            description = r.Description,
            category = r.Category.ToString(),
            isPrimaryHUD = r.IsPrimaryHUD,
            canBeStored = r.CanBeStored,
            maxStorage = r.MaxStorage,
            visibleInUI = r.VisibleInUI
        }));

    [HttpGet("buildings")]
    public IActionResult GetBuildings() =>
        Ok(BuildingCatalog.GetAll().Select(b => new
        {
            id = b.Id,
            displayName = b.DisplayName,
            description = b.Description,
            category = b.Category.ToString(),
            tier = (int)b.Tier,
            constructionCost = b.ConstructionCost.Select(c => new { resource = c.Resource.ToString(), amount = c.Amount }),
            monthlyUpkeep = b.MonthlyUpkeep.Select(c => new { resource = c.Resource.ToString(), amount = c.Amount }),
            monthlyOutput = b.MonthlyOutput.Select(c => new { resource = c.Resource.ToString(), amount = c.Amount }),
            passiveEffects = b.PassiveEffects,
            allowedEnclaves = b.AllowedEnclaves.Select(e => e.ToString()),
            tab = b.UITab.ToString(),
            uiSubTab = b.UISubTab,
            isUnlockedByDefault = b.IsUnlockedByDefault,
            prerequisites = b.Prerequisites
        }));

    [HttpGet("enclaves")]
    public IActionResult GetEnclaves() =>
        Ok(new[] {
            new { id = "CuencaDeEnsayo", name = "Cuenca de Ensayo", description = "Zona de pruebas hidráulicas" },
            new { id = "DistritoDeAudienciaAlta", name = "Distrito de Audiencia Alta", description = "Centro administrativo" },
            new { id = "FactoriaDeRiesgo", name = "Factoría de Riesgo", description = "Zona de procesamiento" },
            new { id = "PabellonDeConcordia", name = "Pabellón de Concordia", description = "Zona de negociaciones" }
        });
}