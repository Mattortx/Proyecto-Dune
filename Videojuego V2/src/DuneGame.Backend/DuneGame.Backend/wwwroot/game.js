// ============================================
// HYDRAULIC DYNASTY MANAGER - Frontend UI
// ============================================

const API_BASE = '';

// Game State
const gameState = {
    resources: { funds: 5000, water: 1000, food: 1000, prestige: 100, staff: 50 },
    population: { total: 100, workers: 50, scientists: 20, guards: 10, nobles: 20, stress: 20 },
    family: { dynastyName: 'Casa Portil', ruler: { name: 'Archivist Vanya', role: 'Regente' }, legitimacy: 80, influence: 50 },
    government: { stability: 70, approval: 60 },
    army: { defense: 50, guards: 20, security: 50, power: 50, morale: 50, discipline: 50 },
    diplomacy: { reputation: 50 },
    events: { timeline: 0 },
    buildings: [],
    districts: [],
    riskLevel: 70,
    production: { water: 2, food: 2, funds: 1 },
    faith: 80,
    military: 50
};

// ============================================
// UI System
// ============================================

function initUI() {
    setupTabs();
    setupBuildBar();
    loadGameData();
    updateAllUI();
    startGameLoop();
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`view-${btn.dataset.tab}`).classList.add('active');
        });
    });
}

function setupBuildBar() {
    document.querySelectorAll('.build-category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.build-category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterBuildings(btn.dataset.category);
        });
    });
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
            Object.assign(gameState.resources, state.resources);
            Object.assign(gameState.population, state.population);
            gameState.family = state.family;
            gameState.government = state.government;
            gameState.army = state.army;
            gameState.diplomacy = state.diplomacy;
            gameState.events = state.events;
            gameState.riskLevel = state.riskLevel;
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
    renderBuildings(gameState.buildings);
    renderDistricts();
}

// ============================================
// UI Updates
// ============================================

function updateAllUI() {
    updateHUD();
    updatePanelView();
    updatePopulationView();
    updateFamilyView();
    updateGovernmentView();
    updateArmyView();
    updateDiplomacyView();
}

function updateHUD() {
    document.getElementById('funds').textContent = gameState.resources.funds;
    document.getElementById('water').textContent = gameState.resources.water;
    document.getElementById('food').textContent = gameState.resources.food;
    document.getElementById('prestige').textContent = gameState.resources.prestige;
    document.getElementById('population').textContent = gameState.population.total;
    document.getElementById('staff').textContent = gameState.resources.staff;

    const riskEl = document.getElementById('risk');
    riskEl.className = 'risk-indicator';
    if (gameState.riskLevel > 80) { riskEl.classList.add('risk-critical'); riskEl.textContent = 'CRÍTICO'; }
    else if (gameState.riskLevel > 60) { riskEl.classList.add('risk-high'); riskEl.textContent = 'ALTO'; }
    else if (gameState.riskLevel > 40) { riskEl.classList.add('risk-medium'); riskEl.textContent = 'MEDIO'; }
    else if (gameState.riskLevel > 20) { riskEl.classList.add('risk-low'); riskEl.textContent = 'BAJO'; }
    else { riskEl.classList.add('risk-stable'); riskEl.textContent = 'ESTABLE'; }
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

async function buildBuilding(buildingId) {
    const building = gameState.buildings.find(b => b.id === buildingId);
    if (!building || building.isBuilt) return;

    const cost = building.cost;
    if (gameState.resources.funds < cost.funds || (cost.water && gameState.resources.water < cost.water)) {
        alert('¡Recursos insuficientes!');
        return;
    }

    gameState.resources.funds -= cost.funds;
    if (cost.water) gameState.resources.water -= cost.water;
    building.isBuilt = true;

    gameState.resources.funds += building.effects.fundsGeneration || 0;
    gameState.resources.water += building.effects.waterGeneration || 0;
    gameState.resources.food += building.effects.foodGeneration || 0;
    gameState.resources.prestige += building.effects.prestigeGeneration || 0;

    renderBuildings(gameState.buildings);
    updateAllUI();
}

function renderDistricts() {
    const grid = document.getElementById('districtsGrid');
    grid.innerHTML = gameState.districts.map(d => `
        <div class="info-card">
            <div class="info-card-label">${d.name}</div>
            <div class="info-card-value">👥 ${d.population}</div>
            <div class="info-card-label" style="margin-top:8px">Agua: ${d.waterUsage}/ciclo</div>
        </div>
    `).join('');
}

// ============================================
// Game Loop
// ============================================

let gameLoopInterval = null;

function startGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameTick, 5000);
}

async function gameTick() {
    try {
        await fetch(`${API_BASE}/api/hydraulic/tick`, { method: 'POST' });
        await loadGameData();
        updateAllUI();
    } catch (e) {
        offlineTick();
    }
}

function offlineTick() {
    const speed = 1;
    const waterBaseProduction = 2;
    const foodBaseProduction = 2;
    const fundsBaseProduction = 1;
    
    let waterGen = waterBaseProduction;
    let foodGen = foodBaseProduction;
    let fundsGen = fundsBaseProduction;
    
    for (const building of gameState.buildings) {
        if (building.isBuilt && building.effects) {
            if (building.effects.waterGeneration) waterGen += building.effects.waterGeneration;
            if (building.effects.foodGeneration) foodGen += building.effects.foodGeneration;
            if (building.effects.fundsGeneration) fundsGen += building.effects.fundsGeneration;
        }
    }
    
    const consumption = Math.floor(gameState.population.total * 0.3);
    
    gameState.resources.water = Math.max(0, Math.min(100000, gameState.resources.water + waterGen - consumption));
    gameState.resources.food = Math.max(0, Math.min(100000, gameState.resources.food + foodGen - consumption));
    gameState.resources.funds = Math.max(0, Math.min(100000, gameState.resources.funds + fundsGen));
    
    function randomVariation() {
        return Math.floor(Math.random() * 3) - 1;
    }
    
    gameState.population.workers = Math.max(10, Math.min(200, gameState.population.workers + randomVariation()));
    gameState.population.total = Math.max(10, Math.min(500, gameState.population.total + randomVariation()));
    gameState.resources.prestige = Math.max(0, Math.min(1000, gameState.resources.prestige + randomVariation()));
    gameState.family.influence = Math.max(0, Math.min(100, gameState.family.influence + randomVariation()));
    gameState.government.stability = Math.max(0, Math.min(100, gameState.government.stability + randomVariation()));
    gameState.government.approval = Math.max(0, Math.min(100, gameState.government.approval + randomVariation()));
    gameState.army.defense = Math.max(0, Math.min(100, gameState.army.defense + randomVariation()));
    gameState.army.power = Math.max(0, Math.min(100, gameState.army.power + randomVariation()));
    gameState.army.morale = Math.max(0, Math.min(100, gameState.army.morale + randomVariation()));
    gameState.army.discipline = Math.max(0, Math.min(100, gameState.army.discipline + randomVariation()));
    gameState.faith = Math.max(0, Math.min(100, gameState.faith + randomVariation()));
    gameState.military = Math.max(0, Math.min(100, gameState.military + randomVariation()));
    
    gameState.events.timeline++;
    
    updateAllUI();
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const startScreen = document.getElementById('startScreen');
    const gameContainer = document.getElementById('gameContainer');
    const btnNewGame = document.getElementById('btnNewGame');
    
    if (btnNewGame && startScreen && gameContainer) {
        btnNewGame.addEventListener('click', function() {
            startScreen.style.display = 'none';
            gameContainer.style.display = 'flex';
            initUI();
        });
    } else {
        initUI();
    }
});