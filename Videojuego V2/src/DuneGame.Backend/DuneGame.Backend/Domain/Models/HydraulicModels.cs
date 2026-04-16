namespace DuneGame.Backend.Domain.Models;

#region Recursos

public class ResourceState
{
    public int Funds { get; set; } = 5000;
    public int Water { get; set; } = 1000;
    public int Food { get; set; } = 1000;
    public int ContainmentMaterial { get; set; } = 500;
    public int SpecializedStaff { get; set; } = 50;
    public int Prestige { get; set; } = 100;
    public int BiologicalData { get; set; } = 100;
    
    public int MaxFunds { get; set; } = 100000;
    public int MaxWater { get; set; } = 10000;
    public int MaxFood { get; set; } = 10000;
    public int MaxContainment { get; set; } = 5000;
    public int MaxStaff { get; set; } = 1000;
    public int MaxPrestige { get; set; } = 10000;
    public int MaxBioData { get; set; } = 10000;
}

public class ResourceCost
{
    public int Funds { get; set; }
    public int Water { get; set; }
    public int Food { get; set; }
    public int Containment { get; set; }
    public int Staff { get; set; }
    public int Prestige { get; set; }
    public int BioData { get; set; }
}

#endregion

#region Edificios

public class Building
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BuildingCategory Category { get; set; }
    public ResourceCost Cost { get; set; } = new();
    public BuildingRequirements Requirements { get; set; } = new();
    public BuildingEffects Effects { get; set; } = new();
    public bool IsBuilt { get; set; }
}

public enum BuildingCategory
{
    Aclima,
    Exhibition,
    Science,
    Logistics,
    Security,
    Archive
}

public class BuildingRequirements
{
    public int RequiredFunds { get; set; }
    public int RequiredWater { get; set; }
    public int RequiredStaff { get; set; }
    public List<string> RequiredTechnology { get; set; } = [];
    public List<string> RequiredBuildings { get; set; } = [];
}

public class BuildingEffects
{
    public int FundsGeneration { get; set; }
    public int WaterGeneration { get; set; }
    public int FoodGeneration { get; set; }
    public int PrestigeGeneration { get; set; }
    public int PopulationCapacity { get; set; }
    public int SecurityBonus { get; set; }
}

public class District
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> Buildings { get; set; } = [];
    public int Population { get; set; }
    public int WaterUsage { get; set; }
}

#endregion

#region Población

public class PopulationState
{
    public int Total { get; set; } = 100;
    public int Workers { get; set; } = 50;
    public int Scientists { get; set; } = 20;
    public int Guards { get; set; } = 10;
    public int Nobles { get; set; } = 20;
    public int StressLevel { get; set; } = 20;
    public BiologicalState BiologicalState { get; set; } = new();
}

public class BiologicalState
{
    public int Health { get; set; } = 80;
    public int Hydration { get; set; } = 80;
    public int Nutrition { get; set; } = 80;
    public int Mutation { get; set; } = 0;
}

#endregion

#region Familia

public class FamilyState
{
    public string DynastyName { get; set; } = "Casa Portil";
    public FamilyMember Ruler { get; set; } = new();
    public List<FamilyMember> Heirs { get; set; } = [];
    public int Influence { get; set; } = 50;
    public int Legitimacy { get; set; } = 80;
}

public class FamilyMember
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Role { get; set; } = string.Empty;
    public MemberStats Stats { get; set; } = new();
}

public class MemberStats
{
    public int Diplomacy { get; set; }
    public int Military { get; set; }
    public int Science { get; set; }
    public int Administration { get; set; }
    public int Charisma { get; set; }
}

#endregion

#region Gobierno

public class GovernmentState
{
    public List<Minister> Ministers { get; set; } = [];
    public int Stability { get; set; } = 70;
    public List<Policy> Policies { get; set; } = [];
    public List<Decree> Decrees { get; set; } = [];
}

public class Minister
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int Skill { get; set; }
    public int Loyalty { get; set; }
}

public class Policy
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ResourceCost Cost { get; set; } = new();
    public int StabilityEffect { get; set; }
    public int PrestigeEffect { get; set; }
}

public class Decree
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

#endregion

#region Ejército

public class ArmyState
{
    public int InternalDefense { get; set; } = 50;
    public int Guards { get; set; } = 20;
    public int SecurityLevel { get; set; } = 50;
}

#endregion

#region Diplomacia

public class DiplomacyState
{
    public List<House> Houses { get; set; } = [];
    public int Reputation { get; set; } = 50;
    public List<Treaty> Treaties { get; set; } = [];
}

public class House
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Power { get; set; }
    public int Hostility { get; set; } = 30;
}

public class Treaty
{
    public string Id { get; set; } = string.Empty;
    public TreatyType Type { get; set; }
    public string SignedWith { get; set; } = string.Empty;
    public int Duration { get; set; }
    public int PrestigeEffect { get; set; }
    public int TradeEffect { get; set; }
}

public enum TreatyType
{
    Trade,
    NonAggression,
    Alliance,
    Vassalage
}

#endregion

#region Eventos

public class EventState
{
    public List<GameEvent> Events { get; set; } = [];
    public int Timeline { get; set; }
    public GameEvent? ActiveEvent { get; set; }
}

public class GameEvent
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public EventType Type { get; set; }
    public int Severity { get; set; }
    public List<EventChoice> Choices { get; set; } = [];
}

public enum EventType
{
    Crisis,
    Opportunity,
    Discovery,
    Political,
    Resource,
    Disaster
}

public class EventChoice
{
    public string Id { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public ResourceCost Requirements { get; set; } = new();
    public EventConsequences Consequences { get; set; } = new();
}

public class EventConsequences
{
    public int FundsChange { get; set; }
    public int WaterChange { get; set; }
    public int FoodChange { get; set; }
    public int StabilityChange { get; set; }
    public int PrestigeChange { get; set; }
    public int PopulationChange { get; set; }
}

#endregion

#region Palacio

public class PalaceState
{
    public string Name { get; set; } = "Palacio Hidráulico Dinástico";
    public int Level { get; set; } = 1;
    public List<string> Features { get; set; } = [];
    public List<string> CurrentEvents { get; set; } = [];
}

#endregion

#region Configuración y Estado Global

public class HydraulicConfig
{
    public int CanvasWidth { get; set; } = 1200;
    public int CanvasHeight { get; set; } = 800;
    public int TickInterval { get; set; } = 5000;
}

public class FullGameState
{
    public ResourceState Resources { get; set; } = new();
    public PopulationState Population { get; set; } = new();
    public FamilyState Family { get; set; } = new();
    public GovernmentState Government { get; set; } = new();
    public ArmyState Army { get; set; } = new();
    public DiplomacyState Diplomacy { get; set; } = new();
    public EventState Events { get; set; } = new();
    public PalaceState Palace { get; set; } = new();
    public List<Building> Buildings { get; set; } = [];
    public List<District> Districts { get; set; } = [];
    public int RiskLevel { get; set; } = 70;
}

#endregion