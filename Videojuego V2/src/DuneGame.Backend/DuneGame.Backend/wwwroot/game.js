// ============================================
// HYDRAULIC DYNASTY MANAGER - Frontend UI
// ============================================

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('[GLOBAL ERROR]', msg, 'Line:', lineNo, 'Col:', columnNo);
    return false;
};

const API_BASE = '';
const DEBUG_MODE = true;
const SAVE_INTERVAL = 15000;
const TICK_INTERVAL = 2000;

function logDebug(component, message, data = null) {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] [${component}] ${message}`, data || '');
}

const STORAGE_KEY = 'hydraulic_dynasty_save';

// ============================================
// CONSTRUCTION PANEL STATE (Persist selection)
// ============================================

const ConstructionState = {
    activeCategory: 'all',
    scrollPosition: 0
};

function setActiveCategory(category) {
    ConstructionState.activeCategory = category;
}

function getActiveCategory() {
    return ConstructionState.activeCategory;
}

function saveScrollPosition(position) {
    ConstructionState.scrollPosition = position;
}

function restoreScrollPosition() {
    const list = document.getElementById('buildingsList');
    if (list && ConstructionState.scrollPosition > 0) {
        list.scrollTop = ConstructionState.scrollPosition;
    }
}

function getScrollPosition() {
    const list = document.getElementById('buildingsList');
    return list ? list.scrollTop : 0;
}

// ============================================
// RESOURCE SYSTEM (Canonical Registry)
// ============================================

const ResourceRegistry = {
    KEYS: ['funds', 'water', 'food', 'prestige', 'staff', 'faith', 'military'],
    _lock: null,
    _pendingOperation: null,
    
    validate(value) {
        if (typeof value !== 'number' || isNaN(value)) return 0;
        return Math.floor(value);
    },
    
    async acquireLock(operationId, timeout = 500) {
        const start = Date.now();
        while (this._lock !== null && this._lock !== operationId) {
            if (Date.now() - start > timeout) {
                console.log('[RESOURCE] Lock timeout, retrying...');
                return false;
            }
            await new Promise(r => setTimeout(r, 10));
        }
        this._lock = operationId;
        this._pendingOperation = operationId;
        return true;
    },
    
    releaseLock(operationId) {
        if (this._lock === operationId) {
            this._lock = null;
            this._pendingOperation = null;
        }
    },
    
    isLocked() {
        return this._lock !== null;
    },
    
    canAfford(resources, costMap) {
        for (const [key, amount] of Object.entries(costMap)) {
            const has = resources[key];
            if (has === undefined || has < amount) return false;
        }
        return true;
    },
    
    deduct(resources, costMap, operationId) {
        if (!this.acquireLock(operationId)) {
            console.log('[RESOURCE] Could not acquire lock for deduction');
            return false;
        }
        
        try {
            if (!this.canAfford(resources, costMap)) {
                return false;
            }
            
            for (const [key, amount] of Object.entries(costMap)) {
                if (resources[key] !== undefined) {
                    const newValue = resources[key] - amount;
                    if (newValue < 0) {
                        console.error(`[RESOURCE] Negative value prevented for ${key}: ${resources[key]} - ${amount}`);
                        return false;
                    }
                    console.log(`[RESOURCE] DEDUCT ${key}: ${resources[key]} - ${amount} = ${newValue}`);
                    resources[key] = newValue;
                }
            }
            console.log('[RESOURCE] Deduction complete, resources:', JSON.stringify(resources));
            return true;
        } finally {
            this.releaseLock(operationId);
        }
    },
    
    addResources(resources, additions) {
        const operationId = 'add_' + Date.now() + '_' + Math.random();
        if (!this.acquireLock(operationId)) {
            return false;
        }
        
        try {
            for (const [key, amount] of Object.entries(additions)) {
                if (resources[key] !== undefined && typeof amount === 'number') {
                    const newValue = resources[key] + amount;
                    resources[key] = Math.max(0, Math.floor(newValue));
                }
            }
            return true;
        } finally {
            this.releaseLock(operationId);
        }
    }
};

// ============================================
// GAME STATE (Single Source of Truth)
// ============================================

const DEFAULT_STATE = () => ({
    resources: {
        funds: 5000,
        water: 1000,
        food: 1000,
        prestige: 100,
        staff: 50,
        plastiacero: 0,
        sellos: 5,
        credito: 0,
        choam: 0,
        registros: 0
    },
    // Source of truth for monthly deltas (set by Simulation, read by UI)
    monthlyDeltas: {
        funds: 0,
        water: 0,
        food: 0,
        prestige: 0,
        plastiacero: 0,
        sellos: 0,
        credito: 0,
        choam: 0,
        registros: 0
    },
    population: {
        total: 100,
        workers: 50,
        scientists: 20,
        guards: 10,
        nobles: 20,
        stress: 20
    },
    government: {
        stability: 70,
        approval: 60
    },
    army: {
        defense: 50,
        guards: 20,
        security: 50,
        power: 50,
        morale: 50,
        discipline: 50
    },
    diplomacy: {
        reputation: 50
    },
    events: {
        timeline: 0,
        day: 1,
        month: 'Cicloceno',
        year: 1020,
        hour: 8
    },
    family: {
        dynastyName: 'Casa Portil',
        ruler: { name: 'Archivist Vanya', role: 'Regente' },
        legitimacy: 80,
        influence: 50
    },
    buildings: [],
    districts: [],
    riskLevel: 70,
    faith: 80,
    military: 50,
    timeSpeed: 1,
    isPaused: false,
    tickCount: 0
});

let gameState = DEFAULT_STATE();

// Status trends
const statusTrends = {
    stability: 'up',
    approval: 'down'
};

// ============================================
// STORAGE SERVICE (Safe)
// ============================================

const StorageService = {
    save(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('SAVE ERROR:', e);
            return false;
        }
    },

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('LOAD ERROR:', e);
        }
        return null;
    },

    delete() {
        localStorage.removeItem(STORAGE_KEY);
    }
};

function saveGameState() {
    StorageService.save(gameState);
}

function loadGameState() {
    const data = StorageService.load();
    if (data) {
        // Deep merge to preserve all default values
        gameState = deepMerge(DEFAULT_STATE(), data);
        return true;
    }
    return false;
}

function deepMerge(defaults, saved) {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
        if (saved[key] !== undefined) {
            if (typeof saved[key] === 'object' && saved[key] !== null && !Array.isArray(saved[key])) {
                result[key] = deepMerge(defaults[key], saved[key]);
            } else {
                result[key] = saved[key];
            }
        }
    }
    return result;
}

// ============================================
// GAME SIMULATION ENGINE
// ============================================

const Simulation = {
    // Base production per cycle (before buildings) - AJUSTADO PARA EARLY GAME VIABLE
    // Tier I: Early game balance - player can survive and build up
    // Production must exceed base population consumption × 1.5 for early game
    baseProduction: { 
        funds: 8,      // +50% from original 5 - basic Solari generation
        water: 4,     // +100% from original 2 - hydraulic baseline
        food: 6,      // +200% from original 2 - CRITICAL: must exceed consumption
        prestige: 1 
    },
    
    // Base consumption per capita per cycle - gradually increases with game progress
    // Early game: 0.3 (was 0.5) to allow player to build food infrastructure
    // Late game: scales up when player has more buildings
    baseConsumption: { water: 0.3, food: 0.3 },
    
    // Consumption scaling factor (increases as game develops)
    consumptionScale: 1.0,
    
    // Production multipliers from buildings (cumulative)
    buildingMultipliers: {
        food: 0,
        water: 0,
        funds: 0,
        prestige: 0
    },
    
    tick() {
        if (gameState.isPaused) {
            return;
        }
        
        gameState.tickCount++;
        const tick = gameState.tickCount;
        
        // Log every 10 ticks to confirm loop is running
        if (tick % 10 === 0) {
            console.log(`[TICK ${tick}] Ejecución activa - timeSpeed:`, gameState.timeSpeed, 'hour:', gameState.events.hour);
        }
        const pop = gameState.population.total;
        const res = gameState.resources;
        const gov = gameState.government;
        
        // Count buildings BEFORE using it
        const buildingsCount = gameState.buildings.filter(b => b.isBuilt).length;
        
        // 1. Calculate production from buildings using new format (output field)
        let buildingProduction = { funds: 0, water: 0, food: 0, prestige: 0, plastiacero: 0, sellos: 0, credito: 0, choam: 0, registros: 0 };
        
        for (const building of gameState.buildings) {
            if (building.isBuilt && building.output) {
                if (building.output.funds) buildingProduction.funds += building.output.funds;
                if (building.output.water) buildingProduction.water += building.output.water;
                if (building.output.food) buildingProduction.food += building.output.food;
                if (building.output.plastiacero) buildingProduction.plastiacero += building.output.plastiacero;
                if (building.output.credito) buildingProduction.credito += building.output.credito;
                if (building.output.choam) buildingProduction.choam += building.output.choam;
                if (building.output.registros) buildingProduction.registros += building.output.registros;
            }
        }
        
        // 2. Calculate total production with multipliers
        const foodMultiplier = 1 + (buildingsCount * 0.05);
        const waterMultiplier = 1 + (buildingsCount * 0.05);
        
        const totalProduction = {
            funds: (this.baseProduction.funds + buildingProduction.funds),
            water: Math.floor((this.baseProduction.water + buildingProduction.water) * waterMultiplier),
            food: Math.floor((this.baseProduction.food + buildingProduction.food) * foodMultiplier),
            prestige: this.baseProduction.prestige,
            plastiacero: buildingProduction.plastiacero,
            credito: buildingProduction.credito,
            choam: buildingProduction.choam,
            registros: buildingProduction.registros
        };
        
        // 3. Calculate consumption - scales with population but capped early game
        const consumptionFactor = Math.min(this.consumptionScale, 1.0 + (buildingsCount * 0.02));
        
        const totalConsumption = {
            water: Math.floor(pop * this.baseConsumption.water * consumptionFactor),
            food: Math.floor(pop * this.baseConsumption.food * consumptionFactor)
        };
        
        // 4. Calculate net deltas BEFORE applying (source of truth for UI)
        const netFunds = totalProduction.funds;
        const netWater = totalProduction.water - totalConsumption.water;
        const netFood = totalProduction.food - totalConsumption.food;
        
        // Store deltas in state (Source of Truth for UI)
        gameState.monthlyDeltas = {
            funds: netFunds,
            water: netWater,
            food: netFood,
            prestige: this.baseProduction.prestige,
            plastiacero: buildingProduction.plastiacero,
            credito: buildingProduction.credito,
            choam: buildingProduction.choam,
            registros: buildingProduction.registros
        };
        
        // 5. Apply economic changes
        
        if (netFunds > 0) res.funds = Math.min(res.funds + netFunds, 100000);
        else res.funds = Math.max(0, res.funds + netFunds);
        
        if (netWater > 0) res.water = Math.min(res.water + netWater, 10000);
        else res.water = Math.max(0, res.water + netWater);
        
        if (netFood > 0) res.food = Math.min(res.food + netFood, 10000);
        else res.food = Math.max(0, res.food + netFood);
        
        // Apply secondary resources
        if (totalProduction.plastiacero) res.plastiacero = (res.plastiacero || 0) + totalProduction.plastiacero;
        if (totalProduction.credito) res.credito = (res.credito || 0) + totalProduction.credito;
        if (totalProduction.choam) res.choam = (res.choam || 0) + totalProduction.choam;
        if (totalProduction.registros) res.registros = (res.registros || 0) + totalProduction.registros;
        
        res.prestige = Math.max(0, Math.min(100, res.prestige + this.baseProduction.prestige));
        
        // 5. Political stability factors - DYNAMIC SYSTEM
        // Approval: varies based on resource abundance, not just one direction
        let stabilityDelta = 0;
        let approvalDelta = 0;
        
        // === APPROVAL SYSTEM (multi-factor) ===
        // Food affects approval significantly
        if (res.food > 1000) approvalDelta += 2;      // Abundance
        else if (res.food > 500) approvalDelta += 1;   // Good
        else if (res.food > 200) approvalDelta += 0;    // Baseline - no change
        else if (res.food > 100) approvalDelta -= 1;  // Scarcity warning
        else approvalDelta -= 3;                      // Critical - major drop
        
        // Water affects approval
        if (res.water > 800) approvalDelta += 2;
        else if (res.water > 400) approvalDelta += 1;
        else if (res.water > 150) approvalDelta += 0;
        else if (res.water > 75) approvalDelta -= 1;
        else approvalDelta -= 3;
        
        // Funds stability affects approval (player can afford things)
        if (res.funds > 2000) approvalDelta += 1;
        else if (res.funds < 200) approvalDelta -= 1;
        
        // Buildings provide development bonus (player progress = approval gain)
        if (buildingsCount >= 3) approvalDelta += 1;
        if (buildingsCount >= 6) approvalDelta += 1;
        
        // Stress penalty - high stress reduces approval
        if (pop.stress > 70) approvalDelta -= 2;
        else if (pop.stress > 50) approvalDelta -= 1;
        
        // === STABILITY SYSTEM (multi-factor) ===
        // Water critical for stability (desert context)
        if (res.water > 600) stabilityDelta += 2;
        else if (res.water > 300) stabilityDelta += 1;
        else if (res.water > 100) stabilityDelta += 0;
        else if (res.water > 50) stabilityDelta -= 2;
        else stabilityDelta -= 4;
        
        // Funds for infrastructure
        if (res.funds > 2500) stabilityDelta += 1;
        else if (res.funds > 500) stabilityDelta += 0;
        else if (res.funds < 150) stabilityDelta -= 1;
        
        // Prestige affects stability
        if (res.prestige > 50) stabilityDelta += 1;
        
        // Buildings provide social order
        if (buildingsCount >= 4) stabilityDelta += 1;
        if (buildingsCount >= 8) stabilityDelta += 1;
        
        // Population stress affects stability
        if (pop.stress > 80) stabilityDelta -= 2;
        else if (pop.stress > 60) stabilityDelta -= 1;
        
        // 6. Apply political changes with clamping and randomization
        // Add small random factor to prevent static behavior
        const randomFactor = () => Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        
        gov.stability = Math.max(0, Math.min(100, gov.stability + stabilityDelta + randomFactor()));
        gov.approval = Math.max(0, Math.min(100, gov.approval + approvalDelta + randomFactor()));
        
        // 7. Update trends - ensure they reflect actual movement, not just direction
        // Also show stability if no change
        const prevStability = gov.stability - stabilityDelta;
        const prevApproval = gov.approval - approvalDelta;
        
        statusTrends.stability = stabilityDelta > 0 ? 'up' : (stabilityDelta < 0 ? 'down' : 'stable');
        statusTrends.approval = approvalDelta > 0 ? 'up' : (approvalDelta < 0 ? 'down' : 'stable');
        
        // 8. Population changes (slower)
        if (tick % 5 === 0) {
            const popDelta = (res.food > 300 && res.water > 300) ? 1 : (res.food < 100 || res.water < 100) ? -1 : 0;
            gameState.population.total = Math.max(10, Math.min(500, gameState.population.total + popDelta));
        }
        
        // 9. Advance time
        this.advanceTime();
        
        if (tick <= 3) {
            console.log(`[TICK ${tick}] DESPUÉS`);
            console.log('  Fondos:', res.funds);
            console.log('  Agua:', res.water);
            console.log('  Comida:', res.food);
            console.log('  Estabilidad:', gov.stability);
            console.log('  Aprobación:', gov.approval);
        }
        
        logDebug('SIM', 'Tick processed', {
            tick: tick,
            funds: res.funds,
            water: res.water,
            food: res.food,
            stability: gov.stability,
            approval: gov.approval
        });
    },
    
    advanceTime() {
        if (gameState.timeSpeed <= 0) return;
        
        gameState.events.hour += gameState.timeSpeed;
        
        while (gameState.events.hour >= 24) {
            gameState.events.hour -= 24;
            gameState.events.day++;
            
            if (gameState.events.day > 30) {
                gameState.events.day = 1;
                const months = ['Cicloceno', 'Deshielo', 'Sequía', 'Aridez', 'Vendaval'];
                const idx = months.indexOf(gameState.events.month);
                gameState.events.month = months[(idx + 1) % months.length];
                
                if ((idx + 1) % months.length === 0) {
                    gameState.events.year++;
                }
            }
        }
        gameState.events.timeline++;
    }
};

// ============================================
// GAME LOOP
// ============================================

let tickInterval = null;
let saveInterval = null;

function startGameLoop() {
    console.log('[LOOP] === INICIANDO SIMULACIÓN ===');
    console.log('[LOOP] Interval:', TICK_INTERVAL, 'ms');
    
    // Simulation tick
    tickInterval = setInterval(() => {
        Simulation.tick();
        updateHUD();
    }, TICK_INTERVAL);
    
    // Auto-save
    saveInterval = setInterval(() => {
        StorageService.save(gameState);
    }, SAVE_INTERVAL);
    
    console.log('[LOOP] Simulación activa');
}

// ============================================
// BUILDING SYSTEM - Data-Driven (Synced with Backend)
// ============================================
// All buildings sourced from BuildingCatalog.cs definitions
// Format: { id, name, category, tier, cost, upkeep, output, effects, description }

const BUILDINGS_DB = [
    // ========== ALIMENTACIÓN ==========
    {
        id: 'despensa_guarnicion', name: 'Despensa de Guarnición', category: 'Alimentacion', tier: 1,
        cost: { funds: 120 }, upkeep: { funds: 8 }, output: { food: 4 }, effects: {},
        description: 'Almacén básico de alimentos para la guarnición.'
    },
    {
        id: 'cocina_estiba', name: 'Cocina de Estiba', category: 'Alimentacion', tier: 2,
        cost: { funds: 260 }, upkeep: { funds: 14 }, output: { food: 8 }, effects: {},
        description: 'Cocina industrial para procesar alimentos para enclaves pequeños.'
    },
    {
        id: 'refectorio_cuenca', name: 'Refectorio de Cuenca', category: 'Alimentacion', tier: 3,
        cost: { funds: 420 }, upkeep: { funds: 22 }, output: { food: 13 }, effects: {},
        description: 'Comedor comunitario de capacidad intermedia.'
    },
    {
        id: 'huerta_niebla', name: 'Huerta de Niebla', category: 'Alimentacion', tier: 4,
        cost: { funds: 700 }, upkeep: { funds: 30, water: 3 }, output: { food: 24 }, effects: { seguridadAlimentaria: 5 },
        description: 'Cultivo hidropónico con niebla artificial.'
    },
    {
        id: 'complejo_hidrocultivo', name: 'Complejo de Hidrocultivo de Vindeiro', category: 'Alimentacion', tier: 5,
        cost: { funds: 1100 }, upkeep: { funds: 42, water: 6 }, output: { food: 38 }, effects: { seguridadAlimentaria: 10 },
        description: 'Instalación de cultivo avanzado de alto rendimiento.',
        prerequisites: ['huerta_niebla']
    },

    // ========== INFRAESTRUCTURA HÍDRICA ==========
    {
        id: 'torre_niebla', name: 'Torre de Niebla', category: 'InfraestructuraHidrica', tier: 1,
        cost: { funds: 160 }, upkeep: { funds: 10 }, output: { water: 2 }, effects: { reduccionEventosClimaticos: 5 },
        description: 'Captadores de niebla para recolección de agua.'
    },
    {
        id: 'planta_recuperacion_hidrica', name: 'Planta de Recuperación Hídrica', category: 'InfraestructuraHidrica', tier: 2,
        cost: { funds: 320 }, upkeep: { funds: 18 }, output: { water: 10 }, effects: {},
        description: 'Sistema de reciclaje y purificación de agua.'
    },
    {
        id: 'red_filtrado_salino', name: 'Red de Filtrado Salino', category: 'InfraestructuraHidrica', tier: 3,
        cost: { funds: 620 }, upkeep: { funds: 28 }, output: { water: 22 }, effects: {},
        description: 'Sistema de desalinización para agua.'
    },
    {
        id: 'cisternas_mayores', name: 'Cisternas Mayores', category: 'InfraestructuraHidrica', tier: 4,
        cost: { funds: 900 }, upkeep: { funds: 24 }, output: { water: 4 }, effects: { capacidadAgua: 500 },
        description: 'Reservorios de gran capacidad.'
    },

    // ========== LOGÍSTICA Y RESERVAS ==========
    {
        id: 'camara_abastos', name: 'Cámara de Abastos', category: 'LogisticaReservas', tier: 1,
        cost: { funds: 140 }, upkeep: { funds: 8 }, output: {}, effects: { capacidadRaciones: 25 },
        description: 'Almacén de alimentos básico.'
    },
    {
        id: 'almacen_estiba', name: 'Almacén de Estiba', category: 'LogisticaReservas', tier: 2,
        cost: { funds: 280 }, upkeep: { funds: 16 }, output: {}, effects: { capacidadGeneral: 35 },
        description: 'Almacén de capacidad mixta.'
    },
    {
        id: 'patio_transferencia', name: 'Patio de Transferencia', category: 'LogisticaReservas', tier: 3,
        cost: { funds: 500 }, upkeep: { funds: 24 }, output: {}, effects: { velocidadLogistica: 15, costeTraslado: -10 },
        description: 'Zona de carga y descarga.'
    },
    {
        id: 'deposito_plastiacero', name: 'Depósito de Plastiacero', category: 'LogisticaReservas', tier: 4,
        cost: { funds: 780 }, upkeep: { funds: 26 }, output: { plastiacero: 4 }, effects: { capacidadMaterial: 20 },
        description: 'Almacén de material de construcción.'
    },

    // ========== CUSTODIA Y CONTROL BIOLÓGICO ==========
    {
        id: 'camara_transito', name: 'Cámara de Tráns ito', category: 'CustodiaBiologica', tier: 1,
        cost: { funds: 180 }, upkeep: { funds: 12 }, output: {}, effects: { reduccionEstres: 10, capacidadSensible: 2 },
        description: 'Zona de paso y control inicial.'
    },
    {
        id: 'patio_cuarentena', name: 'Patio de Cuarentena', category: 'CustodiaBiologica', tier: 2,
        cost: { funds: 360 }, upkeep: { funds: 18, water: 1 }, output: {}, effects: { reduccionBrote: 20, contencion: 12 },
        description: 'Zona de aislamiento preventivo.'
    },
    {
        id: 'camara_linea_sensible', name: 'Cámara de Línea Sensible', category: 'CustodiaBiologica', tier: 3,
        cost: { funds: 620 }, upkeep: { funds: 26, water: 1, sellos: 1 }, output: {}, effects: { estabilidadLinea: 8, reduccionFuga: 15 },
        description: 'Control de línea biológica.'
    },
    {
        id: 'casa_biocontrol', name: 'Casa de Biocontrol', category: 'CustodiaBiologica', tier: 4,
        cost: { funds: 980 }, upkeep: { funds: 38, water: 2 }, output: { registros: 10 }, effects: { recuperacionSanitaria: 20 },
        description: 'Centro de control biológico avanzado.'
    },

    // ========== ARCHIVO, ADMINISTRACIÓN Y ANÁLISIS ==========
    {
        id: 'archivo_caudales', name: 'Archivo de Caudales', category: 'Administracion', tier: 1,
        cost: { funds: 200 }, upkeep: { funds: 12 }, output: { registros: 6 }, effects: {},
        description: 'Centro de registro de datos hidrológicos.'
    },
    {
        id: 'sala_aforos', name: 'Sala de Aforos', category: 'Administracion', tier: 2,
        cost: { funds: 420 }, upkeep: { funds: 22 }, output: {}, effects: { aforoOperativo: 10 },
        description: 'Área de capacidad operativa.',
        prerequisites: ['archivo_caudales']
    },
    {
        id: 'camara_mentat', name: 'Cámara Mentat', category: 'Administracion', tier: 3,
        cost: { funds: 900 }, upkeep: { funds: 40 }, output: { registros: 16 }, effects: { reduccionImpactoCrisis: 10 },
        description: 'Centro de análisis estratégico.',
        prerequisites: ['sala_aforos']
    },
    {
        id: 'cancilleria_cuencas', name: 'Cancillería de Cuencas', category: 'Administracion', tier: 4,
        cost: { funds: 1240 }, upkeep: { funds: 52 }, output: { credito: 2 }, effects: { costeAdministrativo: -10 },
        description: 'Administración central.',
        prerequisites: ['camara_mentat']
    },

    // ========== PRESTIGIO, PROTOCOLO Y CONTRATOS ==========
    {
        id: 'pabellon_audiencia', name: 'Pabellón de Audiencia', category: 'Prestigio', tier: 1,
        cost: { funds: 300 }, upkeep: { funds: 16, water: 1 }, output: { funds: 14, credito: 1 }, effects: {},
        description: 'Sala de recepción oficial.'
    },
    {
        id: 'sala_protocolo', name: 'Sala de Protocolo', category: 'Prestigio', tier: 2,
        cost: { funds: 520 }, upkeep: { funds: 24 }, output: { credito: 2 }, effects: {},
        description: 'Gestión de protocolos oficiales.',
        prerequisites: ['pabellon_audiencia']
    },
    {
        id: 'terraza_patrocinio', name: 'Terraza de Patrocinio', category: 'Prestigio', tier: 3,
        cost: { funds: 860 }, upkeep: { funds: 34, water: 1 }, output: { funds: 18, choam: 1 }, effects: {},
        description: 'Área de eventos y patrocinio.',
        prerequisites: ['sala_protocolo']
    },
    {
        id: 'oficina_choam', name: 'Oficina CHOAM', category: 'Prestigio', tier: 4,
        cost: { funds: 1200 }, upkeep: { funds: 46 }, output: { funds: 24, choam: 2 }, effects: {},
        description: 'Representación del consorcio.',
        prerequisites: ['terraza_patrocinio']
    },

    // ========== SEGURIDAD Y ORDEN ==========
    {
        id: 'anillo_custodia', name: 'Anillo de Custodia', category: 'Seguridad', tier: 1,
        cost: { funds: 220, sellos: 1 }, upkeep: { funds: 14 }, output: {}, effects: { proyeccion: 10, reduccionSabotaje: 8 },
        description: 'Perímetro de control perimetral.'
    },
    {
        id: 'cuartel_guardapuertas', name: 'Cuartel de Guardapuertas', category: 'Seguridad', tier: 2,
        cost: { funds: 480 }, upkeep: { funds: 26 }, output: {}, effects: { proyeccion: 20, respuestaIncidentes: 10 },
        description: 'Alojamiento de tropa.'
    },
    {
        id: 'torre_vigia', name: 'Torre de Vigía', category: 'Seguridad', tier: 3,
        cost: { funds: 650 }, upkeep: { funds: 28 }, output: {}, effects: { deteccion: 12, reduccionFuga: 10 },
        description: 'Torre de observación.'
    },
    {
        id: 'compuerta_sello', name: 'Compuerta de Sello', category: 'Seguridad', tier: 4,
        cost: { funds: 980, sellos: 2 }, upkeep: { funds: 38 }, output: {}, effects: { contencion: 25 },
        description: 'Sistema de cierre automático.'
    },
    {
        id: 'ala_intervencion', name: 'Ala de Intervención', category: 'Seguridad', tier: 5,
        cost: { funds: 1400 }, upkeep: { funds: 52 }, output: {}, effects: { respuestaTactica: 35, reduccionDanoCrisis: 20 },
        description: 'Unidad de respuesta táctica.'
    }
];

function initOfflineData() {
    gameState.buildings = BUILDINGS_DB.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        tier: b.tier,
        cost: b.cost,
        upkeep: b.upkeep,
        output: b.output,
        effects: b.effects,
        prerequisites: b.prerequisites || [],
        isBuilt: false
    }));
    
    gameState.districts = [
        { id: 'd1', name: 'Distrito del Palacio', population: 50, waterUsage: 100 },
        { id: 'd2', name: 'Distrito Comercial', population: 30, waterUsage: 60 },
        { id: 'd3', name: 'Distrito de Investigación', population: 20, waterUsage: 40 }
    ];
}

function buildBuilding(buildingId) {
    const operationId = 'build_' + buildingId + '_' + Date.now();
    
    if (ResourceRegistry.isLocked()) {
        console.log('[BUILD] Operation in progress, please wait...');
        showNotification('Espera', 'Operación en progreso', true);
        return;
    }
    
    console.log('[BUILD] Intentando:', buildingId);
    
    const building = gameState.buildings.find(b => b.id === buildingId);
    if (!building || building.isBuilt) {
        console.log('[BUILD] Error: no disponible o ya construido');
        showNotification('Error', 'Edificio no disponible o ya construido', true);
        return;
    }
    
    const res = gameState.resources;
    const cost = building.cost;
    
    console.log('[BUILD] ========== INICIO CONSTRUCCION ==========');
    console.log('[BUILD] Edificio:', buildingId, '- Coste:', JSON.stringify(cost));
    console.log('[BUILD] Recursos ANTES de procesar:', JSON.stringify(res));
    
    if (!ResourceRegistry.canAfford(res, cost)) {
        console.log('[BUILD] Error: recursos insuficientes');
        const missingResources = [];
        const resourceNames = {
            funds: 'Solari', water: 'Agua', food: 'Comida', sellos: 'Sellos',
            credito: 'Crédito', choam: 'CHOAM', registros: 'Registros', plastiacero: 'Plastiacero'
        };
        for (const [key, amount] of Object.entries(cost)) {
            const has = res[key] || 0;
            console.log(`  - ${key}: tiene ${has}, necesita ${amount}`);
            if (has < amount) {
                const name = resourceNames[key] || key;
                missingResources.push(`${name}: necesitas ${amount}, tienes ${has}`);
            }
        }
        showNotification('Recursos Insuficientes', missingResources.join(', '), true);
        return;
    }
    
    const deductionSuccess = ResourceRegistry.deduct(res, cost, operationId);
    if (!deductionSuccess) {
        console.log('[BUILD] Falló la deducción atómica');
        showNotification('Error', 'No se pudieron deducir recursos', true);
        return;
    }
    
    building.isBuilt = true;
    
    console.log('[BUILD] ========== RESULTADO FINAL ==========');
    console.log('[BUILD] Fondos ANTES:', cost.funds ? res.funds + cost.funds : res.funds, '-> DESPUÉS:', res.funds, '(-' + cost.funds + ')');
    console.log('[BUILD] Agua ANTES:', cost.water ? res.water + cost.water : res.water, '-> DESPUÉS:', res.water, '(-' + cost.water + ')');
    console.log('[BUILD] Comida ANTES:', cost.food ? res.food + cost.food : res.food, '-> DESPUÉS:', res.food, '(-' + cost.food + ')');
    console.log('[BUILD] Recursos finales:', JSON.stringify(res));
logDebug('BUILD', 'Construido', { id: buildingId, name: building.name });
    showNotification('Obra Completada', building.name + ' construída');
    // Re-render preserving active category (no full panel reset)
    renderBuildingsList(getActiveCategory());
    updateHUD();
    console.log('[BUILD] UI actualizada (categoría preservada: ' + getActiveCategory() + ')');
    console.log('[BUILD] Verificando valores en DOM:');
    console.log('  resource-money:', document.getElementById('resource-money')?.textContent);
    console.log('  resource-water:', document.getElementById('resource-water')?.textContent);
    console.log('  resource-food:', document.getElementById('resource-food')?.textContent);
}

// ============================================
// UI SYSTEM
// ============================================

function initUI() {
    // FORZAR LOG AL INICIO
    console.log('%c[INIT] === EJECUTANDO initUI ===', 'color: lime; font-size: 16px; font-weight: bold');
    console.log('[INIT] Limpiando localStorage...');
    
    try {
        // Clear broken saves - use fresh state
        localStorage.removeItem(STORAGE_KEY);
        
        // Reset to clean state
        gameState = DEFAULT_STATE();
        initOfflineData();
        
        console.log('%c[INIT] ✅ Estado limpio: Fondos=' + gameState.resources.funds + ', Agua=' + gameState.resources.water + ', Comida=' + gameState.resources.food, 'color: cyan; font-weight: bold');
        
        setupHUDEvents();
        console.log('[INIT] HUDEvents configurados');
        
        updateHUD();
        console.log('[INIT] HUD actualizado');
        
        renderBuildingsList();
        console.log('[INIT] Edificios renderizados');
        
        startGameLoop();
        console.log('[INIT] Game loop iniciado');
        
        console.log('%c[INIT] ✅ UI COMPLETAMENTE INICIALIZADA', 'color: lime; font-size: 20px');
    } catch (e) {
        console.error('[INIT] ERROR:', e);
    }
}

// ============================================
// HUD Events - Portil Style
// ============================================

function setupHUDEvents() {
    console.log('[EVENTS] Configurando eventos...');
    
    // Menu Button
    const menuBtn = document.getElementById('menuButton');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            console.log('[EVENTS] Click: Menu');
            menuBtn.classList.toggle('active');
            openPanel('mainMenu');
        });
    }

    // Crest Medallion
    const crest = document.getElementById('crestMedallion');
    if (crest) {
        crest.addEventListener('click', () => console.log('[EVENTS] Click: Crest'));
    }

    // Time Control Buttons
    const btnIds = ['btn-pause', 'btn-play', 'btn-fast', 'btn-veryfast'];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                const speed = { 'btn-pause': 0, 'btn-play': 1, 'btn-fast': 2, 'btn-veryfast': 4 }[id];
                console.log('[EVENTS] Click tiempo:', id, 'speed:', speed);
                setTimeSpeed(speed);
            });
        }
    });

    // Command Bar Buttons
    document.querySelectorAll('.command-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            if (btn.classList.contains('blocked')) return;
            
            document.querySelectorAll('.command-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            openPanel(panel);
            
            // Hide novelty dots after click
            btn.querySelector('.novelty-dot')?.remove();
        });
    });

    // Top Command Buttons (Bitácora)
    document.querySelectorAll('.command-btn-top').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            document.querySelectorAll('.command-btn-top').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            openPanel(panel);
        });
    });

    // Resource Card Tooltips
    document.querySelectorAll('.resource-card').forEach(card => {
        const resource = card.dataset.resource;
        card.addEventListener('mouseenter', (e) => showTooltip(e, resource));
        card.addEventListener('mouseleave', hideTooltip);
    });
    
    // Category Tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.cat;
            renderBuildingsByCategory(cat);
        });
    });
}

// ============================================
// Panel System
// ============================================

function openPanel(panelName) {
    const panelMap = {
        'construction': 'constructionPanel',
        'politics': 'politicsPanel',
        'research': 'researchPanel',
        'diplomacy': 'diplomacyPanel',
        'alerts': 'alertsPanel',
        'mainMenu': 'mainMenuModal',
        'house': 'housePanel',
        'army': 'armyPanel', // PREPARED - future implementation
        'expeditions': 'expeditionsPanel' // PREPARED - future implementation
    };
    
    const panelId = panelMap[panelName];
    if (!panelId) return;
    
    // Check if button is blocked (for army placeholder)
    if (panelName === 'army' || panelName === 'expeditions') {
        showNotification('Próximamente', 'El sistema de expediciones está en desarrollo.', true);
        return;
    }
    
    document.getElementById(panelId)?.classList.add('active');
    
    // Load panel content - preserve active category for construction
    if (panelName === 'construction') renderBuildingsList(getActiveCategory());
    else if (panelName === 'politics') renderPolitics();
    else if (panelName === 'research') renderResearch();
    else if (panelName === 'diplomacy') renderDiplomacy();
    else if (panelName === 'alerts') renderAlerts();
    else if (panelName === 'house') renderHousePanel();
    
    // Close other side panels
    if (panelName === 'construction') {
        document.getElementById('diplomacyPanel')?.classList.remove('active');
    } else if (panelName === 'diplomacy') {
        document.getElementById('constructionPanel')?.classList.remove('active');
    }
}

function closePanel(panelName) {
    const panelMap = {
        'construction': 'constructionPanel',
        'politics': 'politicsPanel',
        'research': 'researchPanel',
        'diplomacy': 'diplomacyPanel',
        'alerts': 'alertsPanel',
        'mainMenu': 'mainMenuModal',
        'house': 'housePanel'
    };
    
    const panelId = panelMap[panelName];
    if (!panelId) return;
    
    document.getElementById(panelId)?.classList.remove('active');
    
    // Deselect command button
    document.querySelectorAll('.command-btn').forEach(b => b.classList.remove('selected'));
}

function closeActivePanel() {
    document.querySelectorAll('.panel-side.active, .main-modal.active, .house-panel.active').forEach(p => {
        p.classList.remove('active');
    });
    document.querySelectorAll('.command-btn').forEach(b => b.classList.remove('selected'));
}

function resumeGame() {
    closePanel('mainMenu');
}

function saveGame() {
    // Save to Firebase (cloud)
    const userId = FirebaseService.getUserId();
    const saveId = FirebaseService.generateSaveId();
    
    FirebaseService.SaveService.save(userId, saveId, 'Casa Portil', gameState)
        .then(result => {
            if (result.success) {
                // Also save to localStorage as backup
                StorageService.save(gameState);
                showNotification('Partida Guardada', 'Guardado en la nube.');
            } else {
                showNotification('Error', 'No se pudo guardar: ' + result.error);
            }
        });
}

function loadGame() {
    // Try to load from Firebase first
    const userId = FirebaseService.getUserId();
    
    FirebaseService.SaveService.listSaves(userId)
        .then(result => {
            closePanel('mainMenu');
            
            if (result.success && result.saves.length > 0) {
                // Load most recent save
                const latestSave = result.saves.sort((a, b) => {
                    const aTime = a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.seconds || 0;
                    return bTime - aTime;
                })[0];
                
                if (latestSave.gameState) {
                    Object.assign(gameState, latestSave.gameState);
                    updateHUD();
                    renderBuildingsList();
                    showNotification('Partida Cargada', 'Partida restaurada de la nube.');
                } else {
                    // Fallback to localStorage
                    loadFromLocalStorage();
                }
            } else {
                // Fallback to localStorage
                loadFromLocalStorage();
            }
        })
        .catch(() => {
            closePanel('mainMenu');
            loadFromLocalStorage();
        });
}

function loadFromLocalStorage() {
    const data = StorageService.load();
    if (data) {
        Object.assign(gameState, data);
        updateHUD();
        renderBuildingsList();
        showNotification('Partida Cargada', 'Partida restaurada (local).');
    } else {
        showNotification('Sin Partida', 'No hay partida guardada.');
    }
}

function exitToMainMenu() {
    const startScreen = document.getElementById('startScreen');
    startScreen.style.display = 'flex';
    closePanel('mainMenu');
    gameState.isPaused = true;
}

// ============================================
// Construction Panel
// ============================================

function renderBuildingsList(category = getActiveCategory()) {
    renderBuildingsByCategory(category);
}

function renderBuildingsByCategory(category) {
    const list = document.getElementById('buildingsList');
    if (!list) return;
    
    // Save active category
    setActiveCategory(category);
    
    // Save scroll position before re-render
    saveScrollPosition(getScrollPosition());
    
    let buildings = gameState.buildings;
    if (category !== 'all') {
        buildings = buildings.filter(b => b.category === category);
    }
    
    const tierNames = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
    const resourceIcons = {
        funds: '💰', water: '💧', food: '🍖', sellos: '📜',
        credito: '🏦', choam: '⚗️', registros: '📋', plastiacero: '🔩'
    };
    
    list.innerHTML = buildings.map(b => {
        const costHTML = Object.entries(b.cost)
            .map(([key, amount]) => `<span class="cost-${key}">${resourceIcons[key] || key} ${amount}</span>`)
            .join('');
        
        const outputHTML = Object.entries(b.output)
            .map(([key, amount]) => `<span class="output-${key}">+${amount} ${resourceIcons[key] || key}/mes</span>`)
            .join('');
        
        return `
            <div class="building-card ${b.isBuilt ? 'built' : ''}" onclick="buildBuilding('${b.id}')">
                <div class="building-card-header">
                    <span class="building-name">${b.name}</span>
                    <span class="building-tier">Tier ${tierNames[b.tier] || b.tier}</span>
                </div>
                <div class="building-cost">${costHTML}</div>
                <div class="building-output">${outputHTML}</div>
                ${b.isBuilt ? '<div class="building-status built">✓ Construido</div>' : ''}
            </div>
        `;
    }).join('');
    
    // Update visual active tab
    document.querySelectorAll('.category-tab').forEach(t => {
        t.classList.remove('active');
    });
    document.querySelector(`.category-tab[data-cat="${category}"]`)?.classList.add('active');
    
    // Restore scroll position after render
    setTimeout(() => restoreScrollPosition(), 0);
}

// ============================================
// Politics Panel
// ============================================

const politicsPolicies = [
    { id: 'water_tax', name: 'Impuesto Hidráulico', effect: '+15% fondos, -5% estabilidad', cost: { prestige: 10 }, target: 'all' },
    { id: 'food_rationing', name: 'Racionamiento', effect: '+10% agua, -10% comida', cost: { funds: 100 }, target: 'all' },
    { id: 'security_martial', name: 'Ley Marcial', effect: '+20% seguridad, -10% aprobación', cost: { funds: 200 }, target: 'all' },
    { id: 'religious_fest', name: 'Festival del Río', effect: '+15% fe, +5% prestigio', cost: { funds: 150, prestige: 20 }, target: 'all' },
    { id: 'trade_deal', name: 'Acuerdo Comercial', effect: '+20% fondos/ciclo', cost: { prestige: 30 }, target: 'all' },
    { id: 'propaganda', name: 'Propaganda', effect: '+10% aprobación', cost: { funds: 100 }, target: 'all' }
];

function renderPolitics() {
    const list = document.getElementById('politicsList');
    if (!list) return;
    
    list.innerHTML = politicsPolicies.map(p => `
        <div class="politics-card">
            <div class="politics-header">
                <span class="politics-name">${p.name}</span>
            </div>
            <div class="politics-effect">${p.effect}</div>
            <div class="politics-cost">
                ${p.cost.funds ? `<span>💰 ${p.cost.funds}</span>` : ''}
                ${p.cost.water ? `<span>💧 ${p.cost.water}</span>` : ''}
                ${p.cost.prestige ? `<span>⭐ ${p.cost.prestige}</span>` : ''}
            </div>
            <button class="politics-btn" onclick="enactPolicy('${p.id}')">Aplicar</button>
        </div>
    `).join('');
}

function enactPolicy(policyId) {
    showNotification('Política Aplicada', `La política ${policyId} ha sido implementada.`);
}

// ============================================
// Research Panel
// ============================================

const researchTechs = [
    { id: 'hydraulic_theory', name: 'Teoría Hidráulica', desc: 'Mejora eficiencia de agua +20%', cost: { funds: 500 }, status: 'unlocked', req: null },
    { id: 'desalination', name: 'Desalación', desc: 'Permite construir Plantas de Desalación', cost: { funds: 800, prestige: 20 }, status: 'available', req: 'hydraulic_theory' },
    { id: 'bio_engineering', name: 'Bioingeniería', desc: 'Permite laboratorio biológico', cost: { funds: 1200, staff: 5 }, status: 'available', req: 'hydraulic_theory' },
    { id: 'water_storage', name: 'Almacenamiento Advanced', desc: '+50% capacidad de agua', cost: { funds: 600 }, status: 'locked', req: 'desalination' },
    { id: 'sandstorm_defense', name: 'Defensa contra Tormentas', desc: 'Protección contra desastres', cost: { funds: 1000, prestige: 30 }, status: 'locked', req: 'desalination' }
];

function renderResearch() {
    const tree = document.getElementById('researchTree');
    if (!tree) return;
    
    tree.innerHTML = researchTechs.map(t => `
        <div class="research-node ${t.status}" onclick="unlockTech('${t.id}')">
            <div class="research-node-header">
                <span class="research-name">${t.name}</span>
                <span class="research-status ${t.status}">${t.status === 'unlocked' ? 'Descubierto' : t.status === 'available' ? 'Disponible' : 'Bloqueado'}</span>
            </div>
            <div class="research-desc">${t.desc}</div>
            <div class="research-cost">
                ${t.cost.funds ? `💰 ${t.cost.funds}` : ''}
                ${t.cost.prestige ? ` ⭐ ${t.cost.prestige}` : ''}
                ${t.cost.staff ? ` 👤 ${t.cost.staff}` : ''}
            </div>
        </div>
    `).join('');
}

function unlockTech(techId) {
    showNotification('Tecnología Investigada', `Has descubierto una nueva tecnología.`);
}

// ============================================
// Diplomacy Panel
// ============================================

const houses = [
    { id: 'atreides', name: 'Casa Atreides', emblem: '🦅', power: 90, hostility: 35 },
    { id: 'harkonnen', name: 'Casa Harkonnen', emblem: '🐗', power: 85, hostility: 75 },
    { id: 'corrino', name: 'Casa Corrino', emblem: '🦁', power: 100, hostility: 60 },
    { id: 'fenring', name: 'Casa Fenring', emblem: '🐺', power: 40, hostility: 20 }
];

function renderDiplomacy() {
    const list = document.getElementById('diplomacyList');
    if (!list) return;
    
    list.innerHTML = houses.map(h => {
        let relationClass = 'neutral';
        let relationText = 'Neutral';
        if (h.hostility >= 60) { relationClass = 'hostile'; relationText = 'Hostil'; }
        else if (h.hostility <= 25) { relationClass = 'friendly'; relationText = 'Amistoso'; }
        
        return `
            <div class="diplomacy-card">
                <div class="diplomacy-info">
                    <div class="house-emblem">${h.emblem}</div>
                    <div class="house-details">
                        <div class="house-name">${h.name}</div>
                        <div class="house-power">Poder: ${h.power}</div>
                    </div>
                </div>
                <div class="house-relation">
                    <span class="relation-status ${relationClass}">${relationText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Alerts / Notifications Panel
// ============================================

const notifications = [
    { title: 'Escasez de Agua', content: 'Los almacenes de agua están al 20% de capacidad.', time: 'Día 5, 14:00', critical: true },
    { title: 'Nuevo Edificio', content: 'Cámara Hidráaulica construida exitosamente.', time: 'Día 3, 10:00', critical: false },
    { title: 'Crisis de Población', content: 'La población está creciendo demasiado rápido.', time: 'Día 2, 08:00', critical: false }
];

function renderAlerts() {
    const list = document.getElementById('alertsList');
    if (!list) return;
    
    list.innerHTML = notifications.map(n => `
        <div class="notification ${n.critical ? 'critical' : ''}" style="position: relative; display: block; margin-bottom: 10px;">
            <div class="notification-header">
                <span class="notification-title">${n.title}</span>
                <span class="notification-time">${n.time}</span>
            </div>
            <div class="notification-content">${n.content}</div>
        </div>
    `).join('');
}

function showNotification(title, content, critical = false) {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const existingNotifications = container.querySelectorAll('.notification');
    const stackOffset = existingNotifications.length * 90;
    
    const notif = document.createElement('div');
    notif.className = `notification ${critical ? 'critical' : ''}`;
    notif.style.top = (100 + stackOffset) + 'px';
    notif.style.right = '24px';
    notif.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${title}</span>
            <span class="notification-time">Ahora</span>
        </div>
        <div class="notification-content">${content}</div>
    `;
    
    container.appendChild(notif);
    requestAnimationFrame(() => {
        notif.classList.add('active');
    });
    
    setTimeout(() => {
        notif.classList.remove('active');
        setTimeout(() => {
            if (notif.parentNode) {
                repositionNotifications();
            }
        }, 300);
    }, 4000);
}

function repositionNotifications() {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const notifications = container.querySelectorAll('.notification');
    notifications.forEach((notif, index) => {
        notif.style.top = (100 + index * 90) + 'px';
    });
}

// ============================================
// House Portil Panel
// ============================================

function renderHousePanel() {
    // Update stats
    document.getElementById('house-legitimacy').textContent = gameState.family.legitimacy + '%';
    document.getElementById('house-influence').textContent = gameState.family.influence;
    document.getElementById('house-risk').textContent = gameState.riskLevel + '%';
    document.getElementById('house-population').textContent = gameState.population.total;
    
    // Render family
    const familyList = document.getElementById('houseFamilyList');
    familyList.innerHTML = `
        <div class="family-member-card">
            <div class="member-info">
                <span class="member-name">${gameState.family.ruler.name}</span>
                <span class="member-role">${gameState.family.ruler.role}</span>
            </div>
            <div class="member-stats">
                <span class="stat-badge">DIplo: 80</span>
                <span class="stat-badge">Cien: 60</span>
                <span class="stat-badge">Adm: 70</span>
            </div>
        </div>
        <div class="family-member-card">
            <div class="member-info">
                <span class="member-name">Aurelio</span>
                <span class="member-role">Herdero</span>
            </div>
            <div class="member-stats">
                <span class="stat-badge">DIplo: 50</span>
                <span class="stat-badge">Mil: 40</span>
            </div>
        </div>
    `;
    
    // Render ministers
    const ministersList = document.getElementById('houseMinistersList');
    ministersList.innerHTML = `
        <div class="minister-card">
            <div class="member-info">
                <span class="member-name">Capitán Cael</span>
                <span class="member-role">Defensa</span>
            </div>
            <span class="stat-badge">Habilidad: 75</span>
        </div>
        <div class="minister-card">
            <div class="member-info">
                <span class="member-name">Mercader Seris</span>
                <span class="member-role">Comercio</span>
            </div>
            <span class="stat-badge">Habilidad: 70</span>
        </div>
        <div class="minister-card">
            <div class="member-info">
                <span class="member-name">Sacerdotisa Ilyna</span>
                <span class="member-role">Rituales</span>
            </div>
            <span class="stat-badge">Habilidad: 85</span>
        </div>
    `;
}

function setTimeSpeed(speed) {
    gameState.timeSpeed = speed;
    gameState.isPaused = speed === 0;
    console.log('[TIME] Velocidad:', speed, '- Pausado:', gameState.isPaused);
    
    // Update button states
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    
    if (speed === 0) document.getElementById('btn-pause')?.classList.add('active');
    else if (speed === 1) document.getElementById('btn-play')?.classList.add('active');
    else if (speed === 2) document.getElementById('btn-fast')?.classList.add('active');
    else if (speed === 4) document.getElementById('btn-veryfast')?.classList.add('active');
}

function showTooltip(e, resource) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;
    
    const titles = {
        money: 'Solari - Tesoro de la Casa',
        prestige: 'Prestigio - Capital Simbólico',
        faith: 'Fe - Legitimidad Ritual',
        military: 'Fuerzas Armadas - Defensa',
        water: 'Agua - Recurso Hídrico',
        food: 'Comida - Raciones de Servicio'
    };
    
    const contents = {
        money: 'Recursos financieros disponibles. Usado para construcciones, mantenimiento y operaciones diplomáticas.',
        prestige: 'Rango efectivo dentro del Landsraad. Afecta relaciones exteriores y contratos.',
        faith: 'Adhesión doctrinal al Rito del Río. Mantiene legitimidad interna y rituales.',
        military: 'Preparación militar de la Casa. No indica tropas desplegadas actualmente.',
        water: 'Agua recuperada y purificada. Consumo básico: ' + Math.floor(gameState.population.total * Simulation.baseConsumption.water) + '/ciclo. Almacenamiento máximo: ' + (gameState.resources.water > 8000 ? '10,000' : 'variable') + '.',
        food: 'Raciones de servicio. Consumo básico: ' + Math.floor(gameState.population.total * Simulation.baseConsumption.food) + '/ciclo. Producción base: +' + Simulation.baseProduction.food + '/ciclo. Almacenamiento máximo: 10,000.'
    };
    
    tooltip.querySelector('.tooltip-title').textContent = titles[resource] || '';
    tooltip.querySelector('.tooltip-content').textContent = contents[resource] || '';
    
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
    tooltip.classList.add('visible');
}

function hideTooltip() {
    document.getElementById('tooltip')?.classList.remove('visible');
}

// ============================================
// Data Loading
// ============================================

async function loadGameData() {
    try {
        const [stateRes, buildingsRes] = await Promise.all([
            fetch(`${API_BASE}/api/hydraulic/state`).catch(() => null),
            fetch(`${API_BASE}/api/hydraulic/buildings`).catch(() => null)
        ]);

        if (stateRes?.ok) {
            const state = await stateRes.json();
            
            if (state.resources) {
                const serverFunds = Math.max(0, Math.floor(state.resources.funds || 0));
                const serverWater = Math.max(0, Math.floor(state.resources.water || 0));
                const serverFood = Math.max(0, Math.floor(state.resources.food || 0));
                const serverPrestige = Math.max(0, Math.floor(state.resources.prestige || 0));
                const serverStaff = Math.max(0, Math.floor(state.resources.staff || 0));
                
                gameState.resources = {
                    funds: serverFunds,
                    water: serverWater,
                    food: serverFood,
                    prestige: serverPrestige,
                    staff: serverStaff
                };
            }
            
            if (state.population) {
                gameState.population = {
                    ...gameState.population,
                    ...state.population
                };
            }
            if (state.family) gameState.family = state.family;
            if (state.government) gameState.government = state.government;
            if (state.army) gameState.army = state.army;
            if (state.diplomacy) gameState.diplomacy = state.diplomacy;
            if (state.events) gameState.events = state.events;
            if (typeof state.riskLevel === 'number') gameState.riskLevel = state.riskLevel;
        }

        if (buildingsRes?.ok) {
            gameState.buildings = await buildingsRes.json();
            renderBuildings(gameState.buildings);
        }
    } catch (e) {
        console.log('Running in offline mode');
        initOfflineData();
    }
}

// ============================================
// UI Updates (Safe with canonical resources)
// ============================================

function updateHUD() {
    const res = gameState.resources;
    const gov = gameState.government;
    
    // Resources - safe display
    const setEl = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = (typeof value === 'number' && isFinite(value)) ? Math.floor(value) : '0';
    };
    
    setEl('resource-money', res.funds);
    setEl('resource-prestige', res.prestige);
    setEl('resource-water', res.water);
    setEl('resource-food', res.food);
    setEl('resource-faith', gameState.faith);
    setEl('resource-military', gameState.military);

    // Variations - read from Source of Truth (monthlyDeltas set by Simulation)
    const deltas = gameState.monthlyDeltas || { funds: 0, water: 0, food: 0, prestige: 0 };
    
    updateVariation('variation-money', deltas.funds);
    updateVariation('variation-water', deltas.water);
    updateVariation('variation-food', deltas.food);
    updateVariation('variation-prestige', deltas.prestige);

    // Calendar
    const ev = gameState.events;
    const dayEl = document.getElementById('day-display');
    if (dayEl) dayEl.textContent = ev.day || 1;
    const monthEl = document.getElementById('month-display');
    if (monthEl) monthEl.textContent = `${ev.month || 'Cicloceno'}, ${ev.year || 1020}`;
    const hourEl = document.getElementById('hour-display');
    if (hourEl) hourEl.textContent = String(ev.hour || 8).padStart(2, '0') + ':00';

    // Stability/Approval - SAFE (never NaN)
    updateStatusMeter('stability', gov.stability);
    updateStatusMeter('approval', gov.approval);
}

function updateVariation(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    value = (typeof value === 'number' && isFinite(value)) ? value : 0;
    const sign = value >= 0 ? '+' : '';
    el.textContent = sign + value;
    el.classList.remove('positive', 'negative');
    if (value > 0) el.classList.add('positive');
    else if (value < 0) el.classList.add('negative');
}

function updateStatusMeter(type, value) {
    // SAFE: always finite
    value = (typeof value === 'number' && isFinite(value)) ? value : 0;
    value = Math.max(0, Math.min(100, value));
    
    const bar = document.getElementById(`${type}-bar`);
    const valueEl = document.getElementById(`${type}-value`);
    const trendEl = document.getElementById(`${type}-trend`);
    
    if (bar) {
        bar.style.width = value + '%';
        bar.classList.remove('warning', 'critical');
        if (value < 30) bar.classList.add('critical');
        else if (value < 50) bar.classList.add('warning');
    }
    
    if (valueEl) valueEl.textContent = value + '%';
    
    if (trendEl) {
        trendEl.classList.remove('up', 'down');
        trendEl.textContent = statusTrends[type] === 'up' ? '▲' : '▼';
        trendEl.classList.add(statusTrends[type]);
    }
}

function updatePanelView() {
    document.getElementById('stability').textContent = `${gameState.government.stability}%`;
    document.getElementById('influence').textContent = gameState.family.influence;
    document.getElementById('defense').textContent = gameState.army.defense;
    document.getElementById('reputation').textContent = gameState.diplomacy.reputation;
    document.getElementById('stress').textContent = `${gameState.population.stress}%`;
    document.getElementById('timeline').textContent = gameState.events.timeline;
}

function updatePopulationView() {
    document.getElementById('workers').textContent = gameState.population.workers;
    document.getElementById('scientists').textContent = gameState.population.scientists;
    document.getElementById('guards').textContent = gameState.population.guards;
    document.getElementById('nobles').textContent = gameState.population.nobles;
    document.getElementById('health').textContent = '80%';
    document.getElementById('hydration').textContent = '80%';
}

function updateFamilyView() {
    const list = document.getElementById('familyList');
    list.innerHTML = `
        <div class="family-member">
            <div><div class="member-name">${gameState.family.ruler.name}</div><div class="member-role">${gameState.family.ruler.role}</div></div>
            <div><span class="stat-badge">DIplo:80</span><span class="stat-badge">Cien:60</span><span class="stat-badge">Adm:70</span></div>
        </div>
        <div class="family-member">
            <div><div class="member-name">Aurelio</div><div class="member-role">Herdero</div></div>
            <div><span class="stat-badge">DIplo:50</span><span class="stat-badge">Cien:40</span></div>
        </div>
        <div class="family-member">
            <div><div class="member-name">Isabel</div><div class="member-role">Herdera</div></div>
            <div><span class="stat-badge">DIplo:60</span><span class="stat-badge">Cien:70</span></div>
        </div>
    `;
}

function updateGovernmentView() {
    const list = document.getElementById('ministersList');
    list.innerHTML = `
        <div class="minister-card"><div><div class="minister-name">Capitán Cael</div><div class="minister-dept">Defensa</div></div><span class="stat-badge">Habilidad: 75</span></div>
        <div class="minister-card"><div><div class="minister-name">Mercader Seris</div><div class="minister-dept">Comercio</div></div><span class="stat-badge">Habilidad: 70</span></div>
        <div class="minister-card"><div><div class="minister-name">Sacerdotisa Ilyna</div><div class="minister-dept">Rituales</div></div><span class="stat-badge">Habilidad: 85</span></div>
    `;
}

function updateArmyView() {
    document.getElementById('armyDefense').textContent = gameState.army.defense;
    document.getElementById('armyGuards').textContent = gameState.army.guards;
    document.getElementById('securityLevel').textContent = `${gameState.army.security}%`;
    
    const armyPowerEl = document.getElementById('armyPower');
    if (armyPowerEl) armyPowerEl.textContent = gameState.army.power || 50;
    const armyMoraleEl = document.getElementById('armyMorale');
    if (armyMoraleEl) armyMoraleEl.textContent = gameState.army.morale || 50;
    const armyDisciplineEl = document.getElementById('armyDiscipline');
    if (armyDisciplineEl) armyDisciplineEl.textContent = gameState.army.discipline || 50;
}

function updateDiplomacyView() {
    const list = document.getElementById('housesList');
    list.innerHTML = `
        <div class="house-card"><div><div class="house-name">Casa Atreides</div><div class="house-power">Poder: 90</div></div><span class="house-hostility hostility-medium">Hostilidad: 40%</span></div>
        <div class="house-card"><div><div class="house-name">Casa Harkonnen</div><div class="house-power">Poder: 85</div></div><span class="house-hostility hostility-high">Hostilidad: 70%</span></div>
        <div class="house-card"><div><div class="house-name">Casa Corrino</div><div class="house-power">Poder: 100</div></div><span class="house-hostility hostility-low">Hostilidad: 30%</span></div>
    `;
}

// ============================================
// Building System
// ============================================

function renderBuildings(buildings) {
    const grid = document.getElementById('buildingsGrid');
    if (!grid) return;
    grid.innerHTML = buildings.map(b => `
        <div class="building-card ${b.isBuilt ? 'built' : ''}" onclick="buildBuilding('${b.id}')">
            <div class="building-name">${b.name}</div>
            <div class="building-category">${b.category}</div>
            <div class="building-cost">Cost: ${b.cost.funds}💰 ${b.cost.water ? `+ ${b.cost.water}💧` : ''}</div>
        </div>
    `).join('');
}

function filterBuildings(category) {
    if (category === 'all') {
        renderBuildings(gameState.buildings);
    } else {
        const filtered = gameState.buildings.filter(b => b.category === category);
        renderBuildings(filtered);
    }
}

function renderDistricts() {
    const grid = document.getElementById('districtsGrid');
    if (!grid) return;
    grid.innerHTML = gameState.districts.map(d => `
        <div class="info-card">
            <div class="info-card-label">${d.name}</div>
            <div class="info-card-value">👥 ${d.population}</div>
            <div class="info-card-label" style="margin-top:8px">Agua: ${d.waterUsage}/ciclo</div>
        </div>
    `).join('');
}

// ============================================
// Note: Using LOCAL simulation (Simulation engine)
// startGameLoop is defined earlier in Simulation section
// ============================================

// ============================================
// Initialize - Portil HUD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('%c[BOOT] DOM Cargado', 'color: yellow');
    
    const startScreen = document.getElementById('startScreen');
    const hudRoot = document.getElementById('hudRoot');
    const btnNewGame = document.getElementById('btnNewGame');
    
    if (btnNewGame && startScreen && hudRoot) {
        btnNewGame.addEventListener('click', function() {
            console.log('[BOOT] Click en Nuevo Juego');
            startScreen.style.display = 'none';
            initUI();
        });
    } else {
        // Auto-start for testing
        if (startScreen) startScreen.style.display = 'none';
        initUI();
    }
});