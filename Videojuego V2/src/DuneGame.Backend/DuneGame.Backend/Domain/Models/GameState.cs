using DuneGame.Backend.Domain.Models;
using DuneGame.Backend.Application.Catalogs;

namespace DuneGame.Backend.Domain.Models;

public class GameState
{
    public Dictionary<ResourceId, int> Resources { get; set; } = new();
    public Dictionary<ResourceId, int> MaxResources { get; set; } = new();
    public List<BuildingInstance> BuiltBuildings { get; set; } = [];
    public FamilyState Family { get; set; } = new();
    public GovernmentState Government { get; set; } = new();
    public ArmyState Army { get; set; } = new();
    public DiplomacyState Diplomacy { get; set; } = new();
    public EventState Events { get; set; } = new();
    public int CurrentMonth { get; set; } = 1;
    public int CurrentYear { get; set; } = 1020;
    public int TensionDeCasa { get; set; } = 50;
    public GameState()
    {
        foreach (var res in ResourceCatalog.GetAll())
        {
            Resources[res.Id] = res.Id == ResourceId.Solari ? 5000 :
                           res.Id == ResourceId.AguaRecuperada ? 1000 :
                           res.Id == ResourceId.RacionesDeServicio ? 1000 :
                           res.Id == ResourceId.CuadrosDeCasa ? 100 : 0;
            MaxResources[res.Id] = res.MaxStorage;
        }
    }
}

public class SimulationEngine
{
    private readonly GameState _state;

    public SimulationEngine(GameState state)
    {
        _state = state;
    }

    public SimulationResult Tick()
    {
        var result = new SimulationResult();

        foreach (var building in _state.BuiltBuildings.Where(b => b.IsBuilt && b.IsActive))
        {
            var def = BuildingCatalog.Get(building.DefinitionId);

            foreach (var upkeep in def.MonthlyUpkeep)
            {
                if (_state.Resources[upkeep.Resource] < upkeep.Amount)
                {
                    building.IsActive = false;
                    result.InactiveBuildings.Add(building.DefinitionId);
                    result.FailedUpkeep.Add(building.DefinitionId);
                    break;
                }
                _state.Resources[upkeep.Resource] -= upkeep.Amount;
                result.UpkeepPaid[upkeep.Resource] = (result.UpkeepPaid.GetValueOrDefault(upkeep.Resource) + upkeep.Amount);
            }

            if (!building.IsActive) continue;

            foreach (var output in def.MonthlyOutput)
            {
                var current = _state.Resources[output.Resource];
                var max = _state.MaxResources[output.Resource];
                var toAdd = Math.Min(output.Amount, max - current);
                _state.Resources[output.Resource] += toAdd;
                result.OutputGenerated[output.Resource] = (result.OutputGenerated.GetValueOrDefault(output.Resource) + toAdd);
            }

            foreach (var effect in def.PassiveEffects)
            {
                result.PassiveEffects[effect.Key] = (result.PassiveEffects.GetValueOrDefault(effect.Key) + effect.Value);
            }
        }

        _state.CurrentMonth++;
        if (_state.CurrentMonth > 12)
        {
            _state.CurrentMonth = 1;
            _state.CurrentYear++;
        }

        _state.TensionDeCasa = CalculateTension();

        return result;
    }

    private int CalculateTension()
    {
        int tension = 50;
        foreach (var effect in new[] { "reduccionBrote", "reduccionEstres", "proyeccion", "estabilidadLinea", "contencion" })
        {
            tension -= Math.Min(0, GetPassiveEffect(effect));
        }
        return Math.Clamp(tension, 0, 100);
    }

    private int GetPassiveEffect(string effectName)
    {
        return 0;
    }

    public bool CanBuild(string buildingId, EnclaveId? enclave = null)
    {
        if (!BuildingCatalog.Exists(buildingId)) return false;
        
        var def = BuildingCatalog.Get(buildingId);
        
        if (enclave.HasValue && !def.AllowedEnclaves.Contains(enclave.Value) && def.AllowedEnclaves.Count > 0)
            return false;

        foreach (var cost in def.ConstructionCost)
        {
            if (_state.Resources[cost.Resource] < cost.Amount)
                return false;
        }

        var alreadyBuilt = _state.BuiltBuildings.Count(b => b.DefinitionId == buildingId);
        if (def.BuildLimit.HasValue && alreadyBuilt >= def.BuildLimit.Value)
            return false;

        return true;
    }

    public (bool success, string? error) Build(string buildingId, EnclaveId? enclave = null)
    {
        if (!CanBuild(buildingId, enclave))
            return (false, "No se puede construir");

        var def = BuildingCatalog.Get(buildingId);

        foreach (var cost in def.ConstructionCost)
        {
            _state.Resources[cost.Resource] -= cost.Amount;
        }

        _state.BuiltBuildings.Add(new BuildingInstance
        {
            DefinitionId = buildingId,
            IsBuilt = true,
            IsActive = true,
            Enclave = enclave,
            BuiltAtMonth = _state.CurrentMonth
        });

        return (true, null);
    }

    public bool CanAfford(ResourceAmount[] costs)
    {
        foreach (var cost in costs)
        {
            if (_state.Resources[cost.Resource] < cost.Amount)
                return false;
        }
        return true;
    }
}

public class SimulationResult
{
    public Dictionary<ResourceId, int> UpkeepPaid { get; set; } = new();
    public Dictionary<ResourceId, int> OutputGenerated { get; set; } = new();
    public Dictionary<string, int> PassiveEffects { get; set; } = new();
    public List<string> FailedUpkeep { get; set; } = new();
    public List<string> InactiveBuildings { get; set; } = new();
    public string? Error { get; set; }
}