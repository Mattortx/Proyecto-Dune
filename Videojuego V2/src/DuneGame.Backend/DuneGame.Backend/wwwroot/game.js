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
        staff: 50
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
    // Base production per cycle (before buildings)
    baseProduction: { funds: 5, water: 2, food: 2, prestige: 1 },
    
    // Base consumption per capita per cycle
    baseConsumption: { water: 0.5, food: 0.5 },
    
    tick() {
        if (gameState.isPaused) {
            console.log('[TICK] PAUSADO - no se procesa');
            return;
        }
        
        gameState.tickCount++;
        const tick = gameState.tickCount;
        
        // Debug first ticks
        if (tick <= 3) {
            console.log(`[TICK ${tick}] INICIO`);
            console.log('  Fondos antes:', gameState.resources.funds);
        }
        const pop = gameState.population.total;
        const res = gameState.resources;
        const gov = gameState.government;
        
        // 1. Calculate production from buildings
        let buildingProduction = { funds: 0, water: 0, food: 0, prestige: 0 };
        for (const building of gameState.buildings) {
            if (building.isBuilt && building.effects) {
                if (building.effects.fundsGeneration) buildingProduction.funds += building.effects.fundsGeneration;
                if (building.effects.waterGeneration) buildingProduction.water += building.effects.waterGeneration;
                if (building.effects.foodGeneration) buildingProduction.food += building.effects.foodGeneration;
                if (building.effects.prestigeGeneration) buildingProduction.prestige += building.effects.prestigeGeneration;
            }
        }
        
        // 2. Calculate total production
        const totalProduction = {
            funds: this.baseProduction.funds + buildingProduction.funds,
            water: this.baseProduction.water + buildingProduction.water,
            food: this.baseProduction.food + buildingProduction.food,
            prestige: this.baseProduction.prestige + buildingProduction.prestige
        };
        
        // 3. Calculate consumption
        const totalConsumption = {
            water: Math.floor(pop * this.baseConsumption.water),
            food: Math.floor(pop * this.baseConsumption.food)
        };
        
        // 4. Apply economic changes (atomic calculation to avoid visual fluctuations)
        const netFunds = totalProduction.funds;
        const netWater = totalProduction.water - totalConsumption.water;
        const netFood = totalProduction.food - totalConsumption.food;
        
        if (netFunds > 0) res.funds = Math.min(res.funds + netFunds, 100000);
        else res.funds = Math.max(0, res.funds + netFunds);
        
        if (netWater > 0) res.water = Math.min(res.water + netWater, 10000);
        else res.water = Math.max(0, res.water + netWater);
        
        if (netFood > 0) res.food = Math.min(res.food + netFood, 10000);
        else res.food = Math.max(0, res.food + netFood);
        
        res.prestige = Math.max(0, Math.min(100, res.prestige + totalProduction.prestige));
        
        // 5. Political stability factors
        const buildingsCount = gameState.buildings.filter(b => b.isBuilt).length;
        let stabilityDelta = 0;
        let approvalDelta = 0;
        
        if (res.funds > 3000) stabilityDelta += 1;
        if (res.water > 500) stabilityDelta += 1;
        if (res.food > 500) approvalDelta += 1;
        if (res.water < 200) { stabilityDelta -= 2; approvalDelta -= 1; }
        if (res.food < 200) approvalDelta -= 2;
        if (pop.stress > 70) { stabilityDelta -= 1; approvalDelta -= 1; }
        if (buildingsCount > 0) { stabilityDelta += 1; approvalDelta += 1; }
        
        // 6. Apply political changes with clamping
        gov.stability = Math.max(0, Math.min(100, gov.stability + stabilityDelta));
        gov.approval = Math.max(0, Math.min(100, gov.approval + approvalDelta));
        
        // 7. Update trends
        statusTrends.stability = stabilityDelta >= 0 ? 'up' : 'down';
        statusTrends.approval = approvalDelta >= 0 ? 'up' : 'down';
        
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
// BUILDING SYSTEM (Fully Functional)
// ============================================

const BUILDINGS_DB = [
    { id: 'hydraulic_chamber', name: 'Cámara Hidráulica', category: 'Aclima', 
      cost: { funds: 1000, water: 200 }, 
      effects: { waterGeneration: 50 }, isBuilt: false },
    { id: 'granja', name: 'Granja Hidráulica', category: 'Logistics', 
      cost: { funds: 600, water: 50 }, 
      effects: { foodGeneration: 5 }, isBuilt: false },
    { id: 'almacen_alimento', name: 'Almacén de Alimentos', category: 'Logistics', 
      cost: { funds: 400 }, 
      effects: { foodStorage: 20 }, isBuilt: false },
    { id: 'canal_riego', name: 'Canal de Riego', category: 'Aclima', 
      cost: { funds: 800, water: 100 }, 
      effects: { foodGeneration: 2 }, isBuilt: false },
    { id: 'ceremonial_plaza', name: 'Plaza Ceremonial', category: 'Exhibition', 
      cost: { funds: 800, prestige: 50 }, 
      effects: { prestigeGeneration: 20 }, isBuilt: false },
    { id: 'biology_lab', name: 'Laboratorio Biológico', category: 'Science', 
      cost: { funds: 1500, staff: 10 }, 
      effects: { foodGeneration: 10 }, isBuilt: false },
    { id: 'water_plant', name: 'Planta de Agua', category: 'Logistics', 
      cost: { funds: 2000, water: 100 }, 
      effects: { waterGeneration: 100 }, isBuilt: false },
    { id: 'water_wall', name: 'Muro Hidráulico', category: 'Security', 
      cost: { funds: 1200, water: 200 }, 
      effects: { securityBonus: 30 }, isBuilt: false },
    { id: 'data_chamber', name: 'Cámara de Datos', category: 'Archive', 
      cost: { funds: 600, prestige: 50 }, 
      effects: { prestigeGeneration: 10 }, isBuilt: false },
    { id: 'water_depot', name: 'Depósito de Agua', category: 'Logistics', 
      cost: { funds: 500, water: 100 }, 
      effects: { waterGeneration: 20 }, isBuilt: false },
    { id: 'filtration_plant', name: 'Planta de Filtrado', category: 'Logistics', 
      cost: { funds: 800, staff: 5 }, 
      effects: { foodGeneration: 30 }, isBuilt: false }
];

function initOfflineData() {
    // Initialize with building DB and copy effects
    gameState.buildings = BUILDINGS_DB.map(b => ({ ...b }));
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
        for (const [key, amount] of Object.entries(cost)) {
            const has = res[key] || 0;
            console.log(`  - ${key}: tiene ${has}, necesita ${amount}`);
            if (has < amount) {
                const name = { funds: 'Fondos', water: 'Agua', food: 'Alimento', prestige: 'Prestigio' }[key] || key;
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
    showNotification('Obra Completada', building.name + ' construida');
    renderBuildingsList();
    updateHUD();
    console.log('[BUILD] UI actualizada, verificanco valores en DOM:');
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
        'house': 'housePanel'
    };
    
    const panelId = panelMap[panelName];
    if (!panelId) return;
    
    document.getElementById(panelId)?.classList.add('active');
    
    // Load panel content
    if (panelName === 'construction') renderBuildingsList();
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
    const success = StorageService.save(gameState);
    showNotification('Partida Guardada', success ? 'Guardado correctamente.' : 'Error al guardar.');
}

function loadGame() {
    closePanel('mainMenu');
    const data = StorageService.load();
    if (data) {
        Object.assign(gameState, data);
        updateHUD();
        showNotification('Partida Cargada', 'Partida restaurada.');
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

function renderBuildingsList() {
    const list = document.getElementById('buildingsList');
    if (!list) return;
    
    list.innerHTML = gameState.buildings.map(b => {
        const costHTML = [];
        if (b.cost.funds) costHTML.push(`<span class="cost-funds">💰 ${b.cost.funds}</span>`);
        if (b.cost.water) costHTML.push(`<span class="cost-water">💧 ${b.cost.water}</span>`);
        if (b.cost.food) costHTML.push(`<span class="cost-food">🍖 ${b.cost.food}</span>`);
        
        const effectsHTML = [];
        if (b.effects.waterGeneration) effectsHTML.push(`+${b.effects.waterGeneration} agua/ciclo`);
        if (b.effects.foodGeneration) effectsHTML.push(`+${b.effects.foodGeneration} comida/ciclo`);
        if (b.effects.fundsGeneration) effectsHTML.push(`+${b.effects.fundsGeneration} fondos/ciclo`);
        if (b.effects.prestigeGeneration) effectsHTML.push(`+${b.effects.prestigeGeneration} prestigio/ciclo`);
        if (b.effects.securityBonus) effectsHTML.push(`+${b.effects.securityBonus} seguridad`);
        
        return `
            <div class="building-card ${b.isBuilt ? 'built' : ''}" onclick="buildBuilding('${b.id}')">
                <div class="building-card-header">
                    <span class="building-name">${b.name}</span>
                    <span class="building-category">${b.category}</span>
                </div>
                <div class="building-cost">${costHTML.join('')}</div>
                ${effectsHTML.length ? `<div class="building-effect">${effectsHTML.join(', ')}</div>` : ''}
                ${b.isBuilt ? '<div class="building-status built">✓ Construido</div>' : ''}
            </div>
        `;
    }).join('');
}

function renderBuildingsByCategory(category) {
    const list = document.getElementById('buildingsList');
    if (!list) return;
    
    let buildings = gameState.buildings;
    if (category !== 'all') {
        buildings = buildings.filter(b => b.category === category);
    }
    
    list.innerHTML = buildings.map(b => {
        const costHTML = [];
        if (b.cost.funds) costHTML.push(`<span class="cost-funds">💰 ${b.cost.funds}</span>`);
        if (b.cost.water) costHTML.push(`<span class="cost-water">💧 ${b.cost.water}</span>`);
        if (b.cost.food) costHTML.push(`<span class="cost-food">🍖 ${b.cost.food}</span>`);
        
        const effectsHTML = [];
        if (b.effects.waterGeneration) effectsHTML.push(`+${b.effects.waterGeneration} agua/ciclo`);
        if (b.effects.foodGeneration) effectsHTML.push(`+${b.effects.foodGeneration} comida/ciclo`);
        if (b.effects.fundsGeneration) effectsHTML.push(`+${b.effects.fundsGeneration} fondos/ciclo`);
        
        return `
            <div class="building-card ${b.isBuilt ? 'built' : ''}" onclick="buildBuilding('${b.id}')">
                <div class="building-card-header">
                    <span class="building-name">${b.name}</span>
                    <span class="building-category">${b.category}</span>
                </div>
                <div class="building-cost">${costHTML.join('')}</div>
                ${effectsHTML.length ? `<div class="building-effect">${effectsHTML.join(', ')}</div>` : ''}
                ${b.isBuilt ? '<div class="building-status built">✓ Construido</div>' : ''}
            </div>
        `;
    }).join('');
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
        money: 'Fondos - Tesorería de la Casa',
        prestige: 'Prestigio - Capital Simbólico',
        faith: 'Fe - Legitimidad Ritual',
        military: 'Fuerzas Armadas - Defensa'
    };
    
    const contents = {
        money: 'Recursos financieros disponibles para construcciones, mantenimiento y diplomático.',
        prestige: 'Rango efectivo dentro del Landsraad. Afecta relaciones exteriores.',
        faith: 'Adhesión doctrinal al Rito del Río. Mantiene legitimidad interna.',
        military: 'Preparación militar de la Casa. No indica tropas desplegadas.'
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

function initOfflineData() {
    gameState.buildings = [
        { id: 'hydraulic_chamber', name: 'Cámara Hidráulica', category: 'Aclima', cost: { funds: 1000, water: 200 }, effects: { waterGeneration: 50 }, isBuilt: false },
        { id: 'granja', name: 'Granja Hidráulica', category: 'Logistics', cost: { funds: 600, water: 50 }, effects: { foodGeneration: 5 }, isBuilt: false },
        { id: 'almacen_alimento', name: 'Almacén de Alimentos', category: 'Logistics', cost: { funds: 400 }, effects: { foodStorage: 20 }, isBuilt: false },
        { id: 'canal_riego', name: 'Canal de Riego', category: 'Aclima', cost: { funds: 800, water: 100 }, effects: { foodGeneration: 2, waterDistribution: 10 }, isBuilt: false },
        { id: 'ceremonial_plaza', name: 'Plaza Ceremonial', category: 'Exhibition', cost: { funds: 800, prestige: 50 }, effects: { prestigeGeneration: 20 }, isBuilt: false },
        { id: 'biology_lab', name: 'Laboratorio Biológico', category: 'Science', cost: { funds: 1500, staff: 10 }, effects: { foodGeneration: 10 }, isBuilt: false },
        { id: 'water_plant', name: 'Planta de Agua', category: 'Logistics', cost: { funds: 2000, water: 100 }, effects: { waterGeneration: 100 }, isBuilt: false },
        { id: 'water_wall', name: 'Muro Hidráulico', category: 'Security', cost: { funds: 1200, water: 200 }, effects: { securityBonus: 30 }, isBuilt: false },
        { id: 'data_chamber', name: 'Cámara de Datos', category: 'Archive', cost: { funds: 600, prestige: 50 }, effects: { prestigeGeneration: 10 }, isBuilt: false },
        { id: 'water_depot', name: 'Depósito de Agua', category: 'Logistics', cost: { funds: 500, water: 100 }, effects: { waterGeneration: 20 }, isBuilt: false },
        { id: 'filtration_plant', name: 'Planta de Filtrado', category: 'Logistics', cost: { funds: 800, staff: 5 }, effects: { foodGeneration: 30 }, isBuilt: false }
    ];
    gameState.districts = [
        { id: 'd1', name: 'Distrito del Palacio', population: 50, waterUsage: 100 },
        { id: 'd2', name: 'Distrito Comercial', population: 30, waterUsage: 60 },
        { id: 'd3', name: 'Distrito de Investigación', population: 20, waterUsage: 40 }
    ];
    
    // Solo renderizar si los elementos existen
    try {
        if (document.getElementById('buildingsGrid')) {
            renderBuildings(gameState.buildings);
        }
        if (document.getElementById('districtsGrid')) {
            renderDistricts();
        }
    } catch(e) {
        console.log('[INIT] Grid elements not found, skipping render');
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

    // Variations
    updateVariation('variation-money', Simulation.baseProduction.funds);
    updateVariation('variation-water', Simulation.baseProduction.water);
    updateVariation('variation-food', Simulation.baseProduction.food);
    updateVariation('variation-prestige', Simulation.baseProduction.prestige);

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