using DuneGame.Backend.Domain.Models;

namespace DuneGame.Backend.Application.Catalogs;

public static class BuildingCatalog
{
    private static readonly Dictionary<string, BuildingDefinition> _buildings = new()
    {
        #region ALIMENTACIÓN
        
        ["despensa_guarnicion"] = new BuildingDefinition
        {
            Id = "despensa_guarnicion",
            DisplayName = "Despensa de Guarnición",
            Description = "Almacén básico de alimentos para la guarnición.",
            Category = BuildingType.Alimentacion,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 120)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 8)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RacionesDeServicio, 4)],
            UITab = UITab.Obras,
            UISubTab = "Alimentacion",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.DistritoDeAudienciaAlta, EnclaveId.FactoriaDeRiesgo, EnclaveId.PabellonDeConcordia]
        },
        ["cocina_estiba"] = new BuildingDefinition
        {
            Id = "cocina_estiba",
            DisplayName = "Cocina de Estiba",
            Description = "Cocina industrial para procesar alimentos para enclaves pequeños.",
            Category = BuildingType.Alimentacion,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 260)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 14)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RacionesDeServicio, 8)],
            UITab = UITab.Obras,
            UISubTab = "Alimentacion",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.DistritoDeAudienciaAlta, EnclaveId.FactoriaDeRiesgo, EnclaveId.PabellonDeConcordia]
        },
        ["refectorio_cuenca"] = new BuildingDefinition
        {
            Id = "refectorio_cuenca",
            DisplayName = "Refectorio de Cuenca",
            Description = "Comedor comunitario de capacidad intermedia.",
            Category = BuildingType.Alimentacion,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 420)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 22)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RacionesDeServicio, 13)],
            UITab = UITab.Obras,
            UISubTab = "Alimentacion",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.DistritoDeAudienciaAlta, EnclaveId.FactoriaDeRiesgo, EnclaveId.PabellonDeConcordia]
        },
        ["huerta_niebla"] = new BuildingDefinition
        {
            Id = "huerta_niebla",
            DisplayName = "Huerta de Niebla",
            Description = "Cultivo hidropónico con niebla artificial.",
            Category = BuildingType.Alimentacion,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 700)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 30), new ResourceAmount(ResourceId.AguaRecuperada, 3)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RacionesDeServicio, 24)],
            PassiveEffects = { ["seguridadAlimentaria"] = 5 },
            UITab = UITab.Obras,
            UISubTab = "Alimentacion",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.PabellonDeConcordia]
        },
        ["complejo_hidrocultivo"] = new BuildingDefinition
        {
            Id = "complejo_hidrocultivo",
            DisplayName = "Complejo de Hidrocultivo de Vindeiro",
            Description = "Instalación de cultivo avanzado de alto rendimiento.",
            Category = BuildingType.Alimentacion,
            Tier = BuildingTier.V,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 1100)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 42), new ResourceAmount(ResourceId.AguaRecuperada, 6)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RacionesDeServicio, 38)],
            PassiveEffects = { ["seguridadAlimentaria"] = 10 },
            UITab = UITab.Obras,
            UISubTab = "Alimentacion",
            IsUnlockedByDefault = true,
            Prerequisites = ["huerta_niebla"],
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.PabellonDeConcordia]
        },

        #endregion

        #region INFRAESTRUCTURA HÍDRICA

        ["torre_niebla"] = new BuildingDefinition
        {
            Id = "torre_niebla",
            DisplayName = "Torre de Niebla",
            Description = "Captadores de niebla para recolección de agua.",
            Category = BuildingType.InfraestructuraHidrica,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 160)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 10)],
            MonthlyOutput = [new ResourceAmount(ResourceId.AguaRecuperada, 2)],
            PassiveEffects = { ["reduccionEventosClimaticos"] = 5 },
            UITab = UITab.Obras,
            UISubTab = "InfraestructuraHidrica",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.PabellonDeConcordia]
        },
        ["planta_recuperacion_hidrica"] = new BuildingDefinition
        {
            Id = "planta_recuperacion_hidrica",
            DisplayName = "Planta de Recuperación Hídrica",
            Description = "Sistema de reciclaje y purificación de agua.",
            Category = BuildingType.InfraestructuraHidrica,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 320)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 18)],
            MonthlyOutput = [new ResourceAmount(ResourceId.AguaRecuperada, 10)],
            UITab = UITab.Obras,
            UISubTab = "InfraestructuraHidrica",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.PabellonDeConcordia]
        },
        ["red_filtrado_salino"] = new BuildingDefinition
        {
            Id = "red_filtrado_salino",
            DisplayName = "Red de Filtrado Salino",
            Description = "Sistema de desalinización para agua.",
            Category = BuildingType.InfraestructuraHidrica,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 620)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 28)],
            MonthlyOutput = [new ResourceAmount(ResourceId.AguaRecuperada, 22)],
            UITab = UITab.Obras,
            UISubTab = "InfraestructuraHidrica",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.PabellonDeConcordia]
        },
        ["cisternas_mayores"] = new BuildingDefinition
        {
            Id = "cisternas_mayores",
            DisplayName = "Cisternas Mayores",
            Description = "Reservorios de gran capacidad.",
            Category = BuildingType.InfraestructuraHidrica,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 900)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 24)],
            PassiveEffects = { ["capacidadAgua"] = 500 },
            UITab = UITab.Obras,
            UISubTab = "InfraestructuraHidrica",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.PabellonDeConcordia]
        },

        #endregion

        #region LOGÍSTICA Y RESERVAS

        ["camara_abastos"] = new BuildingDefinition
        {
            Id = "camara_abastos",
            DisplayName = "Cámara de Abastos",
            Description = "Almacén de alimentos básico.",
            Category = BuildingType.LogisticaReservas,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 140)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 8)],
            PassiveEffects = { ["capacidadRaciones"] = 25 },
            UITab = UITab.Obras,
            UISubTab = "LogisticaReservas",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.DistritoDeAudienciaAlta, EnclaveId.FactoriaDeRiesgo, EnclaveId.PabellonDeConcordia]
        },
        ["almacen_estiba"] = new BuildingDefinition
        {
            Id = "almacen_estiba",
            DisplayName = "Almacén de Estiba",
            Description = "Almacén de capacidad mixta.",
            Category = BuildingType.LogisticaReservas,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 280)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 16)],
            PassiveEffects = { ["capacidadGeneral"] = 35 },
            UITab = UITab.Obras,
            UISubTab = "LogisticaReservas",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo, EnclaveId.DistritoDeAudienciaAlta, EnclaveId.FactoriaDeRiesgo, EnclaveId.PabellonDeConcordia]
        },
        ["patio_transferencia"] = new BuildingDefinition
        {
            Id = "patio_transferencia",
            DisplayName = "Patio de Transferencia",
            Description = "Zona de carga y descarga.",
            Category = BuildingType.LogisticaReservas,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 500)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 24)],
            PassiveEffects = { ["velocidadLogistica"] = 15, ["costeTraslado"] = -10 },
            UITab = UITab.Obras,
            UISubTab = "LogisticaReservas",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.DistritoDeAudienciaAlta, EnclaveId.FactoriaDeRiesgo]
        },
        ["deposito_plastiacero"] = new BuildingDefinition
        {
            Id = "deposito_plastiacero",
            DisplayName = "Depósito de Plastiacero",
            Description = "Almacén de material de construcción.",
            Category = BuildingType.LogisticaReservas,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 780)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 26)],
            MonthlyOutput = [new ResourceAmount(ResourceId.Plastiacero, 4)],
            PassiveEffects = { ["capacidadMaterial"] = 20 },
            UITab = UITab.Obras,
            UISubTab = "LogisticaReservas",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo, EnclaveId.CuencaDeEnsayo]
        },

        #endregion

        #region CUSTODIA Y CONTROL BIOLÓGICO

        ["camara_transito"] = new BuildingDefinition
        {
            Id = "camara_transito",
            DisplayName = "Cámara de Tráns ito",
            Description = "Zona de paso y control inicial.",
            Category = BuildingType.CustodiaControl,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 180)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 12)],
            PassiveEffects = { ["reduccionEstres"] = 10, ["capacidadSensib le"] = 2 },
            UITab = UITab.Custodia,
            UISubTab = "CustodiaControl",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo, EnclaveId.CuencaDeEnsayo]
        },
        ["patio_cuarentena"] = new BuildingDefinition
        {
            Id = "patio_cuarentena",
            DisplayName = "Patio de Cuarentena",
            Description = "Zona de aislamiento preventivo.",
            Category = BuildingType.CustodiaControl,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 360)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 18), new ResourceAmount(ResourceId.AguaRecuperada, 1)],
            PassiveEffects = { ["reduccionBrote"] = 20, ["contencion"] = 12 },
            UITab = UITab.Custodia,
            UISubTab = "CustodiaControl",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo]
        },
        ["camara_linea_sensible"] = new BuildingDefinition
        {
            Id = "camara_linea_sensible",
            DisplayName = "Cámara de Línea Sensible",
            Description = "Control de línea biológica.",
            Category = BuildingType.CustodiaControl,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 580)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 26), new ResourceAmount(ResourceId.AguaRecuperada, 1), new ResourceAmount(ResourceId.SellosDeCustodia, 1)],
            PassiveEffects = { ["estabilidadLinea"] = 8, ["reduccionFuga"] = 15 },
            UITab = UITab.Custodia,
            UISubTab = "CustodiaControl",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo]
        },
        ["casa_biocontrol"] = new BuildingDefinition
        {
            Id = "casa_biocontrol",
            DisplayName = "Casa de Biocontrol",
            Description = "Centro de control biológico avanzado.",
            Category = BuildingType.CustodiaControl,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 980)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 38), new ResourceAmount(ResourceId.AguaRecuperada, 2)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RegistrosDeCaudal, 10)],
            PassiveEffects = { ["recuperacionSanitaria"] = 20 },
            UITab = UITab.Custodia,
            UISubTab = "CustodiaControl",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo]
        },

        #endregion

        #region ARCHIVO, ADMINISTRACIÓN Y ANÁLISIS

        ["archivo_caudales"] = new BuildingDefinition
        {
            Id = "archivo_caudales",
            DisplayName = "Archivo de Caudales",
            Description = "Centro de registro de datos hidrológicos.",
            Category = BuildingType.ArchivoAnalisis,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 200)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 12)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RegistrosDeCaudal, 6)],
            UITab = UITab.ArchivoMentat,
            UISubTab = "CienciaArchivo",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo]
        },
        ["sala_aforos"] = new BuildingDefinition
        {
            Id = "sala_aforos",
            DisplayName = "Sala de Aforos",
            Description = "Área de capacidad operativa.",
            Category = BuildingType.ArchivoAnalisis,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 420)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 22)],
            PassiveEffects = { ["aforoOperativo"] = 10 },
            UITab = UITab.ArchivoMentat,
            UISubTab = "CienciaArchivo",
            IsUnlockedByDefault = true,
            Prerequisites = ["archivo_caudales"],
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo]
        },
        ["camara_mentat"] = new BuildingDefinition
        {
            Id = "camara_mentat",
            DisplayName = "Cámara Mentat",
            Description = "Centro de análisis estratégico.",
            Category = BuildingType.ArchivoAnalisis,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 900)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 40)],
            MonthlyOutput = [new ResourceAmount(ResourceId.RegistrosDeCaudal, 16)],
            PassiveEffects = { ["reduccionImpactoCrisis"] = 10 },
            UITab = UITab.ArchivoMentat,
            UISubTab = "CienciaArchivo",
            IsUnlockedByDefault = true,
            Prerequisites = ["sala_aforos"],
            AllowedEnclaves = [EnclaveId.CuencaDeEnsayo]
        },
        ["cancilleria_cuencas"] = new BuildingDefinition
        {
            Id = "cancilleria_cuencas",
            DisplayName = "Cancillería de Cuencas",
            Description = "Administración central.",
            Category = BuildingType.ArchivoAnalisis,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 1240)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 52)],
            MonthlyOutput = [new ResourceAmount(ResourceId.CreditoLandsraad, 2)],
            PassiveEffects = { ["costeAdministrativo"] = -10 },
            UITab = UITab.ArchivoMentat,
            UISubTab = "CienciaArchivo",
            IsUnlockedByDefault = true,
            Prerequisites = ["camara_mentat"],
            AllowedEnclaves = [EnclaveId.DistritoDeAudienciaAlta]
        },

        #endregion

        #region PRESTIGIO, PROTOCOLO Y CONTRATOS

        ["pabellon_audiencia"] = new BuildingDefinition
        {
            Id = "pabellon_audiencia",
            DisplayName = "Pabellón de Audiencia",
            Description = "Sala de recepción oficial.",
            Category = BuildingType.PrestigioProtocolo,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 300)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 16), new ResourceAmount(ResourceId.AguaRecuperada, 1)],
            MonthlyOutput = [new ResourceAmount(ResourceId.Solari, 14), new ResourceAmount(ResourceId.CreditoLandsraad, 1)],
            UITab = UITab.Hacienda,
            UISubTab = "PrestigioProtocolo",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.DistritoDeAudienciaAlta]
        },
        ["sala_protocolo"] = new BuildingDefinition
        {
            Id = "sala_protocolo",
            DisplayName = "Sala de Protocolo",
            Description = "Gestión de protocolos oficiales.",
            Category = BuildingType.PrestigioProtocolo,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 520)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 24)],
            MonthlyOutput = [new ResourceAmount(ResourceId.CreditoLandsraad, 2)],
            UITab = UITab.Hacienda,
            UISubTab = "PrestigioProtocolo",
            IsUnlockedByDefault = true,
            Prerequisites = ["pabellon_audiencia"],
            AllowedEnclaves = [EnclaveId.DistritoDeAudienciaAlta]
        },
        ["terraza_patrocinio"] = new BuildingDefinition
        {
            Id = "terraza_patrocinio",
            DisplayName = "Terraza de Patrocinio",
            Description = "Área de eventos y patrocinio.",
            Category = BuildingType.PrestigioProtocolo,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 860)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 34), new ResourceAmount(ResourceId.AguaRecuperada, 1)],
            MonthlyOutput = [new ResourceAmount(ResourceId.Solari, 18), new ResourceAmount(ResourceId.ParticipacionesCHOAM, 1)],
            UITab = UITab.Hacienda,
            UISubTab = "PrestigioProtocolo",
            IsUnlockedByDefault = true,
            Prerequisites = ["sala_protocolo"],
            AllowedEnclaves = [EnclaveId.DistritoDeAudienciaAlta]
        },
        ["oficina_choam"] = new BuildingDefinition
        {
            Id = "oficina_choam",
            DisplayName = "Oficina CHOAM",
            Description = "Representación del consorcio.",
            Category = BuildingType.PrestigioProtocolo,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 1200)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 46)],
            MonthlyOutput = [new ResourceAmount(ResourceId.Solari, 24), new ResourceAmount(ResourceId.ParticipacionesCHOAM, 2)],
            UITab = UITab.Hacienda,
            UISubTab = "PrestigioProtocolo",
            IsUnlockedByDefault = true,
            Prerequisites = ["terraza_patrocinio"],
            AllowedEnclaves = [EnclaveId.DistritoDeAudienciaAlta]
        },

        #endregion

        #region SEGURIDAD Y ORDEN

        ["anillo_custodia"] = new BuildingDefinition
        {
            Id = "anillo_custodia",
            DisplayName = "Anillo de Custodia",
            Description = "Perímetro de control perimetral.",
            Category = BuildingType.SeguridadOrden,
            Tier = BuildingTier.I,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 220)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 14), new ResourceAmount(ResourceId.SellosDeCustodia, 1)],
            PassiveEffects = { ["proyeccion"] = 10, ["reduccionSabotaje"] = 8 },
            UITab = UITab.Casa,
            UISubTab = "SeguridadOrden",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo, EnclaveId.CuencaDeEnsayo]
        },
        ["cuartel_guardapuertas"] = new BuildingDefinition
        {
            Id = "cuartel_guardapuertas",
            DisplayName = "Cuartel de Guardapuertas",
            Description = "Alojamiento de tropa.",
            Category = BuildingType.SeguridadOrden,
            Tier = BuildingTier.II,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 480)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 26)],
            PassiveEffects = { ["proyeccion"] = 20, ["respuestaIncidentes"] = 10 },
            UITab = UITab.Casa,
            UISubTab = "SeguridadOrden",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo, EnclaveId.CuencaDeEnsayo]
        },
        ["torre_vigia"] = new BuildingDefinition
        {
            Id = "torre_vigia",
            DisplayName = "Torre de Vigía",
            Description = "Torre de observación.",
            Category = BuildingType.SeguridadOrden,
            Tier = BuildingTier.III,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 650)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 28)],
            PassiveEffects = { ["deteccion"] = 12, ["reduccionFuga"] = 10 },
            UITab = UITab.Casa,
            UISubTab = "SeguridadOrden",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo, EnclaveId.CuencaDeEnsayo]
        },
        ["compuerta_sello"] = new BuildingDefinition
        {
            Id = "compuerta_sello",
            DisplayName = "Compuerta de Sello",
            Description = "Sistema de cierre automático.",
            Category = BuildingType.SeguridadOrden,
            Tier = BuildingTier.IV,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 980)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 38), new ResourceAmount(ResourceId.SellosDeCustodia, 2)],
            PassiveEffects = { ["contencion"] = 25 },
            UITab = UITab.Casa,
            UISubTab = "SeguridadOrden",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo]
        },
        ["ala_intervencion"] = new BuildingDefinition
        {
            Id = "ala_intervencion",
            DisplayName = "Ala de Intervención",
            Description = "Unidad de respuesta táctica.",
            Category = BuildingType.SeguridadOrden,
            Tier = BuildingTier.V,
            ConstructionCost = [new ResourceAmount(ResourceId.Solari, 1400)],
            MonthlyUpkeep = [new ResourceAmount(ResourceId.Solari, 52)],
            PassiveEffects = { ["respuestaTactica"] = 35, ["reduccionDanoCrisis"] = 20 },
            UITab = UITab.Casa,
            UISubTab = "SeguridadOrden",
            IsUnlockedByDefault = true,
            AllowedEnclaves = [EnclaveId.FactoriaDeRiesgo]
        }

        #endregion
    };

    public static BuildingDefinition Get(string id) => _buildings[id];
    
    public static IEnumerable<BuildingDefinition> GetAll() => _buildings.Values;
    
    public static IEnumerable<BuildingDefinition> GetByCategory(BuildingType category) =>
        _buildings.Values.Where(b => b.Category == category);
    
    public static IEnumerable<BuildingDefinition> GetByTab(UITab tab) =>
        _buildings.Values.Where(b => b.UITab == tab);

    public static IEnumerable<BuildingDefinition> GetByEnclave(EnclaveId enclave) =>
        _buildings.Values.Where(b => b.AllowedEnclaves.Contains(enclave) || b.AllowedEnclaves.Count == 0);

    public static bool Exists(string id) => _buildings.ContainsKey(id);
    
    public static bool HasDuplicates() =>
        _buildings.Values.GroupBy(b => b.Id).Any(g => g.Count() > 1);
}