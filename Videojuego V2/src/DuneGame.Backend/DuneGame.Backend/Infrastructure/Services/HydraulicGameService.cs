using DuneGame.Backend.Application.Interfaces;
using DuneGame.Backend.Domain.Models;
using System.Threading;

namespace DuneGame.Backend.Infrastructure.Services;

public class HydraulicGameService : IHydraulicGameService
{
    #region Campos Privados

    private readonly HydraulicConfig _config;
    private FullGameState _gameState;
    private readonly SemaphoreSlim _resourceLock = new(1, 1);

    #endregion

    #region Constructor

    public HydraulicGameService()
    {
        _config = new HydraulicConfig();
        _gameState = InitializeGameState();
    }

    #endregion

    #region Métodos de Obtención de Datos

    public HydraulicConfig GetConfig() => _config;
    public FullGameState GetInitialState() => _gameState;
    public FullGameState GetCurrentState() => _gameState;
    public List<Building> GetBuildings() => _gameState.Buildings;
    public List<District> GetDistricts() => _gameState.Districts;
    public ResourceState GetResources() => _gameState.Resources;
    public PopulationState GetPopulation() => _gameState.Population;
    public FamilyState GetFamily() => _gameState.Family;
    public GovernmentState GetGovernment() => _gameState.Government;
    public ArmyState GetArmy() => _gameState.Army;
    public DiplomacyState GetDiplomacy() => _gameState.Diplomacy;
    public EventState GetEvents() => _gameState.Events;
    public PalaceState GetPalace() => _gameState.Palace;

    #endregion

    #region Gestión Atómica de Recursos

    private bool TryConsumeResources(ResourceCost cost)
    {
        _resourceLock.Wait();
        try
        {
            var res = _gameState.Resources;
            if (res.Funds < cost.Funds || res.Water < cost.Water || res.Food < cost.Food ||
                res.ContainmentMaterial < cost.Containment || res.SpecializedStaff < cost.Staff ||
                res.Prestige < cost.Prestige || res.BiologicalData < cost.BioData)
            {
                return false;
            }

            res.Funds -= cost.Funds;
            res.Water -= cost.Water;
            res.Food -= cost.Food;
            res.ContainmentMaterial -= cost.Containment;
            res.SpecializedStaff -= cost.Staff;
            res.Prestige -= cost.Prestige;
            res.BiologicalData -= cost.BioData;

            return true;
        }
        finally
        {
            _resourceLock.Release();
        }
    }

    private void ReleaseResources(ResourceCost cost)
    {
        _resourceLock.Wait();
        try
        {
            var res = _gameState.Resources;
            res.Funds += cost.Funds;
            res.Water += cost.Water;
            res.Food += cost.Food;
            res.ContainmentMaterial += cost.Containment;
            res.SpecializedStaff += cost.Staff;
            res.Prestige += cost.Prestige;
            res.BiologicalData += cost.BioData;
        }
        finally
        {
            _resourceLock.Release();
        }
    }

    #endregion

    #region Construcción de Edificios

    public bool Build(string buildingId)
    {
        _resourceLock.Wait();
        try
        {
            var building = _gameState.Buildings.FirstOrDefault(b => b.Id == buildingId);
            if (building == null || building.IsBuilt) return false;

            var res = _gameState.Resources;
            var cost = building.Cost;

            if (res.Funds < cost.Funds || res.Water < cost.Water || res.Food < cost.Food ||
                res.ContainmentMaterial < cost.Containment || res.SpecializedStaff < cost.Staff ||
                res.Prestige < cost.Prestige || res.BiologicalData < cost.BioData)
            {
                return false;
            }

            res.Funds -= cost.Funds;
            res.Water -= cost.Water;
            res.Food -= cost.Food;
            res.ContainmentMaterial -= cost.Containment;
            res.SpecializedStaff -= cost.Staff;
            res.Prestige -= cost.Prestige;
            res.BiologicalData -= cost.BioData;

            building.IsBuilt = true;

            res.Funds = Math.Min(res.MaxFunds, res.Funds + building.Effects.FundsGeneration);
            res.Water = Math.Min(res.MaxWater, res.Water + building.Effects.WaterGeneration);
            res.Food = Math.Min(res.MaxFood, res.Food + building.Effects.FoodGeneration);
            res.Prestige = Math.Min(res.MaxPrestige, res.Prestige + building.Effects.PrestigeGeneration);
            _gameState.Population.Total += building.Effects.PopulationCapacity;

            return true;
        }
        finally
        {
            _resourceLock.Release();
        }
    }

    #endregion

    #region Gestión de Eventos

    public bool ProcessEventChoice(string eventId, string choiceId)
    {
        _resourceLock.Wait();
        try
        {
            var evt = _gameState.Events.ActiveEvent;
            if (evt == null || evt.Id != eventId) return false;

            var choice = evt.Choices.FirstOrDefault(c => c.Id == choiceId);
            if (choice == null) return false;

            var res = _gameState.Resources;
            var req = choice.Requirements;

            if (res.Funds < req.Funds || res.Water < req.Water || res.Food < req.Food ||
                res.ContainmentMaterial < req.Containment || res.SpecializedStaff < req.Staff ||
                res.Prestige < req.Prestige || res.BiologicalData < req.BioData)
            {
                return false;
            }

            res.Funds -= req.Funds;
            res.Water -= req.Water;
            res.Food -= req.Food;
            res.ContainmentMaterial -= req.Containment;
            res.SpecializedStaff -= req.Staff;
            res.Prestige -= req.Prestige;
            res.BiologicalData -= req.BioData;

            var cons = choice.Consequences;
            res.Funds = Math.Min(res.MaxFunds, res.Funds + cons.FundsChange);
            res.Water = Math.Min(res.MaxWater, res.Water + cons.WaterChange);
            res.Food = Math.Min(res.MaxFood, res.Food + cons.FoodChange);
            res.Prestige = Math.Min(res.MaxPrestige, res.Prestige + cons.PrestigeChange);
            _gameState.Government.Stability = Math.Clamp(_gameState.Government.Stability + cons.StabilityChange, 0, 100);
            _gameState.Population.Total += cons.PopulationChange;

            _gameState.Events.ActiveEvent = null;
            return true;
        }
        finally
        {
            _resourceLock.Release();
        }
    }

    #endregion

    #region Ciclo del Juego

    public void Tick()
    {
        _resourceLock.Wait();
        try
        {
            _gameState.Events.Timeline++;

            foreach (var b in _gameState.Buildings.Where(b => b.IsBuilt))
            {
                _gameState.Resources.Funds = Math.Min(_gameState.Resources.MaxFunds, 
                    _gameState.Resources.Funds + b.Effects.FundsGeneration);
                _gameState.Resources.Water = Math.Min(_gameState.Resources.MaxWater, 
                    _gameState.Resources.Water + b.Effects.WaterGeneration);
                _gameState.Resources.Food = Math.Min(_gameState.Resources.MaxFood, 
                    _gameState.Resources.Food + b.Effects.FoodGeneration);
                _gameState.Resources.Prestige = Math.Min(_gameState.Resources.MaxPrestige, 
                    _gameState.Resources.Prestige + b.Effects.PrestigeGeneration);
            }

            var pop = _gameState.Population;
            _gameState.Resources.Water = Math.Max(0, _gameState.Resources.Water - pop.Total);
            _gameState.Resources.Food = Math.Max(0, _gameState.Resources.Food - pop.Total);

            _gameState.RiskLevel = CalculateRiskLevelInternal();
        }
        finally
        {
            _resourceLock.Release();
        }
    }

    private int CalculateRiskLevelInternal()
    {
        var army = _gameState.Army;
        var gov = _gameState.Government;
        var pop = _gameState.Population;

        int risk = 100;
        risk -= army.InternalDefense / 2;
        risk -= gov.Stability;
        risk += pop.StressLevel / 2;

        return Math.Clamp(risk, 0, 100);
    }

    #endregion

    #region Inicialización

    private FullGameState InitializeGameState()
    {
        var state = new FullGameState
        {
            Resources = new ResourceState(),
            Population = new PopulationState(),
            Family = new FamilyState
            {
                Ruler = new FamilyMember
                {
                    Id = "ruler_1",
                    Name = "Archivist Vanya",
                    Age = 45,
                    Role = "Regente",
                    Stats = new MemberStats { Diplomacy = 80, Science = 60, Administration = 70, Charisma = 75 }
                },
                Heirs =
                [
                    new FamilyMember { Id = "heir_1", Name = "Aurelio", Age = 22, Role = "Herdero", Stats = new MemberStats { Diplomacy = 50, Science = 40, Administration = 45, Charisma = 55 } },
                    new FamilyMember { Id = "heir_2", Name = "Isabel", Age = 18, Role = "Herdera", Stats = new MemberStats { Diplomacy = 60, Science = 70, Administration = 50, Charisma = 65 } }
                ]
            },
            Government = new GovernmentState
            {
                Stability = 70,
                Ministers =
                [
                    new Minister { Id = "min_1", Name = "Capitán Cael", Department = "Defensa", Skill = 75, Loyalty = 80 },
                    new Minister { Id = "min_2", Name = "Mercader Seris", Department = "Comercio", Skill = 70, Loyalty = 65 },
                    new Minister { Id = "min_3", Name = "Sacerdotisa Ilyna", Department = "Rituales", Skill = 85, Loyalty = 90 }
                ]
            },
            Army = new ArmyState { InternalDefense = 50, Guards = 20, SecurityLevel = 50 },
            Diplomacy = new DiplomacyState
            {
                Reputation = 50,
                Houses =
                [
                    new House { Id = "house_atreides", Name = "Casa Atreides", Power = 90, Hostility = 40 },
                    new House { Id = "house_harkonnen", Name = "Casa Harkonnen", Power = 85, Hostility = 70 },
                    new House { Id = "house_corrino", Name = "Casa Corrino", Power = 100, Hostility = 30 }
                ]
            },
            Palace = new PalaceState
            {
                Level = 1,
                Features = ["Sala del Consejo", "Archivo Dinástico", "Cámara Hidráulica"]
            },
            Buildings = InitializeBuildings(),
            Districts =
            [
                new District { Id = "district_1", Name = "Distrito del Palacio", Population = 50 },
                new District { Id = "district_2", Name = "Distrito Comercial", Population = 30 },
                new District { Id = "district_3", Name = "Distrito de Investigación", Population = 20 }
            ]
        };

        return state;
    }

    private List<Building> InitializeBuildings()
    {
        return
        [
            new Building { Id = "hydraulic_chamber", Name = "Cámara Hidráulica", Category = BuildingCategory.Aclima, Cost = new ResourceCost { Funds = 1000, Water = 200 }, Effects = new BuildingEffects { WaterGeneration = 50, PopulationCapacity = 10 } },
            new Building { Id = "ceremonial_plaza", Name = "Plaza Ceremonial", Category = BuildingCategory.Exhibition, Cost = new ResourceCost { Funds = 800, Prestige = 50 }, Effects = new BuildingEffects { PrestigeGeneration = 20 } },
            new Building { Id = "biology_lab", Name = "Laboratorio Biológico", Category = BuildingCategory.Science, Cost = new ResourceCost { Funds = 1500, Staff = 10 }, Effects = new BuildingEffects { FoodGeneration = 10 } },
            new Building { Id = "water_plant", Name = "Planta de Agua", Category = BuildingCategory.Logistics, Cost = new ResourceCost { Funds = 2000, Water = 100 }, Effects = new BuildingEffects { WaterGeneration = 100 } },
            new Building { Id = "water_wall", Name = "Muro Hidráulico", Category = BuildingCategory.Security, Cost = new ResourceCost { Funds = 1200, Containment = 200 }, Effects = new BuildingEffects { SecurityBonus = 30 } },
            new Building { Id = "data_chamber", Name = "Cámara de Datos", Category = BuildingCategory.Archive, Cost = new ResourceCost { Funds = 600, BioData = 50 }, Effects = new BuildingEffects { PrestigeGeneration = 10 } },
            new Building { Id = "water_depot", Name = "Depósito de Agua", Category = BuildingCategory.Logistics, Cost = new ResourceCost { Funds = 500, Containment = 100 }, Effects = new BuildingEffects { WaterGeneration = 20 } },
            new Building { Id = "filtration_plant", Name = "Planta de Filtrado", Category = BuildingCategory.Logistics, Cost = new ResourceCost { Funds = 800, Staff = 5 }, Effects = new BuildingEffects { FoodGeneration = 30 } }
        ];
    }

    #endregion
}