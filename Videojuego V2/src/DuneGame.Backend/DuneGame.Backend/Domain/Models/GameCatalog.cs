namespace DuneGame.Backend.Domain.Models;

#region Resource Definitions

public enum ResourceId
{
    Solari,
    AguaRecuperada,
    RacionesDeServicio,
    Plastiacero,
    SellosDeCustodia,
    CuadrosDeCasa,
    RegistrosDeCaudal,
    CreditoLandsraad,
    ParticipacionesCHOAM,
    MelangeDeProtocolo
}

public class ResourceDefinition
{
    public ResourceId Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ResourceCategory Category { get; set; }
    public bool IsPrimaryHUD { get; set; }
    public bool CanBeStored { get; set; }
    public int MaxStorage { get; set; } = int.MaxValue;
    public bool VisibleInUI { get; set; } = true;
}

public enum ResourceCategory
{
    Currency,
    Vital,
    Material,
    Prestige,
    Contract,
    Biological,
    Administrative
}

public class ResourceAmount
{
    public ResourceId Resource { get; set; }
    public int Amount { get; set; }

    public ResourceAmount() { }
    public ResourceAmount(ResourceId resource, int amount)
    {
        Resource = resource;
        Amount = amount;
    }
}

public class ResourceStock
{
    public ResourceId Resource { get; set; }
    public int Current { get; set; }
    public int Max { get; set; } = int.MaxValue;
}

#endregion

#region Enclave Definitions

public enum EnclaveId
{
    CuencaDeEnsayo,
    DistritoDeAudienciaAlta,
    FactoriaDeRiesgo,
    PabellonDeConcordia
}

public class EnclaveDefinition
{
    public EnclaveId Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsGlobal { get; set; }
    public List<BuildingType> AllowedTypes { get; set; } = [];
}

#endregion

#region Building Definitions

public enum BuildingType
{
    Alimentacion,
    InfraestructuraHidrica,
    LogisticaReservas,
    CustodiaControl,
    ArchivoAnalisis,
    PrestigioProtocolo,
    SeguridadOrden,
    Palacio,
    Exhibicion,
    Ciencia
}

public enum BuildingTier
{
    I = 1,
    II = 2,
    III = 3,
    IV = 4,
    V = 5
}

public class BuildingDefinition
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BuildingType Category { get; set; }
    public BuildingTier Tier { get; set; }
    public List<ResourceAmount> ConstructionCost { get; set; } = [];
    public List<ResourceAmount> MonthlyUpkeep { get; set; } = [];
    public List<ResourceAmount> MonthlyOutput { get; set; } = [];
    public Dictionary<string, int> PassiveEffects { get; set; } = [];
    public List<EnclaveId> AllowedEnclaves { get; set; } = [];
    public UITab UITab { get; set; }
    public string UISubTab { get; set; } = string.Empty;
    public bool IsUnlockedByDefault { get; set; } = true;
    public List<string> Prerequisites { get; set; } = [];
    public int? BuildLimit { get; set; }
    public string? UpgradePath { get; set; }
}

public enum UITab
{
    Casa,
    Enclaves,
    Obras,
    Hacienda,
    Contratos,
    Custodia,
    ArchivoMentat,
    Crisis
}

public enum UISubTab
{
    InfraestructuraHidrica,
    LogisticaReservas,
    CustodiaControl,
    CienciaArchivo,
    PrestigioProtocolo,
    SeguridadOrden
}

#endregion

#region Building State (Runtime)

public class BuildingInstance
{
    public string DefinitionId { get; set; } = string.Empty;
    public bool IsBuilt { get; set; }
    public bool IsActive { get; set; } = true;
    public EnclaveId? Enclave { get; set; }
    public int BuiltAtMonth { get; set; }
}

#endregion
