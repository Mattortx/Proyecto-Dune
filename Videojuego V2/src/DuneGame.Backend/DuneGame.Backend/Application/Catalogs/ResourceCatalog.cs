using DuneGame.Backend.Domain.Models;

namespace DuneGame.Backend.Application.Catalogs;

public static class ResourceCatalog
{
    private static readonly Dictionary<ResourceId, ResourceDefinition> _resources = new()
    {
        [ResourceId.Solari] = new ResourceDefinition
        {
            Id = ResourceId.Solari,
            DisplayName = "Solari",
            Description = "Moneda principal de la Casa. Usada para construcciones, mantenimiento y operaciones.",
            Category = ResourceCategory.Currency,
            IsPrimaryHUD = true,
            CanBeStored = true,
            MaxStorage = 100000,
            VisibleInUI = true
        },
        [ResourceId.AguaRecuperada] = new ResourceDefinition
        {
            Id = ResourceId.AguaRecuperada,
            DisplayName = "Agua Recuperada",
            Description = "Agua reciclada y purificada para consumo interno y procesos.",
            Category = ResourceCategory.Vital,
            IsPrimaryHUD = true,
            CanBeStored = true,
            MaxStorage = 10000,
            VisibleInUI = true
        },
        [ResourceId.RacionesDeServicio] = new ResourceDefinition
        {
            Id = ResourceId.RacionesDeServicio,
            DisplayName = "Raciones de Servicio",
            Description = "Alimentos preparados para la guarnición y personal.",
            Category = ResourceCategory.Vital,
            IsPrimaryHUD = true,
            CanBeStored = true,
            MaxStorage = 10000,
            VisibleInUI = true
        },
        [ResourceId.Plastiacero] = new ResourceDefinition
        {
            Id = ResourceId.Plastiacero,
            DisplayName = "Plastiacero",
            Description = "Material de construcción y refuerzo estructural.",
            Category = ResourceCategory.Material,
            IsPrimaryHUD = true,
            CanBeStored = true,
            MaxStorage = 5000,
            VisibleInUI = true
        },
        [ResourceId.SellosDeCustodia] = new ResourceDefinition
        {
            Id = ResourceId.SellosDeCustodia,
            DisplayName = "Sellos de Custodia",
            Description = "Autorización para manejo de material biológico sensible.",
            Category = ResourceCategory.Biological,
            IsPrimaryHUD = false,
            CanBeStored = true,
            MaxStorage = 500,
            VisibleInUI = true
        },
        [ResourceId.CuadrosDeCasa] = new ResourceDefinition
        {
            Id = ResourceId.CuadrosDeCasa,
            DisplayName = "Cuadros de Casa",
            Description = "Representación genealógica y prestige de la Casa.",
            Category = ResourceCategory.Prestige,
            IsPrimaryHUD = true,
            CanBeStored = true,
            MaxStorage = 1000,
            VisibleInUI = true
        },
        [ResourceId.RegistrosDeCaudal] = new ResourceDefinition
        {
            Id = ResourceId.RegistrosDeCaudal,
            DisplayName = "Registros de Caudal",
            Description = "Datos hidrológicos y de flujo hídrico del enclave.",
            Category = ResourceCategory.Administrative,
            IsPrimaryHUD = false,
            CanBeStored = true,
            MaxStorage = 2000,
            VisibleInUI = true
        },
        [ResourceId.CreditoLandsraad] = new ResourceDefinition
        {
            Id = ResourceId.CreditoLandsraad,
            DisplayName = "Crédito Landsraad",
            Description = "Línea de crédito oficial del Landsraad.",
            Category = ResourceCategory.Currency,
            IsPrimaryHUD = false,
            CanBeStored = true,
            MaxStorage = 5000,
            VisibleInUI = true
        },
        [ResourceId.ParticipacionesCHOAM] = new ResourceDefinition
        {
            Id = ResourceId.ParticipacionesCHOAM,
            DisplayName = "Participaciones CHOAM",
            Description = "Acciones en el consorcio CHOAM.",
            Category = ResourceCategory.Contract,
            IsPrimaryHUD = false,
            CanBeStored = true,
            MaxStorage = 1000,
            VisibleInUI = true
        },
        [ResourceId.MelangeDeProtocolo] = new ResourceDefinition
        {
            Id = ResourceId.MelangeDeProtocolo,
            DisplayName = "Melange de Protocolo",
            Description = "Sustancia restringida para protocolos especiales.",
            Category = ResourceCategory.Biological,
            IsPrimaryHUD = false,
            CanBeStored = true,
            MaxStorage = 100,
            VisibleInUI = true
        }
    };

    public static ResourceDefinition Get(ResourceId id) => _resources[id];
    
    public static IEnumerable<ResourceDefinition> GetAll() => _resources.Values;
    
    public static IEnumerable<ResourceDefinition> GetPrimaryHUD() => 
        _resources.Values.Where(r => r.IsPrimaryHUD);

    public static IEnumerable<ResourceDefinition> GetVisible() => 
        _resources.Values.Where(r => r.VisibleInUI);

    public static bool Exists(ResourceId id) => _resources.ContainsKey(id);
}
