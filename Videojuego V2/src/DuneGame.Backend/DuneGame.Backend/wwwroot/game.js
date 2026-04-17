// ============================================
// HYDRAULIC DYNASTY MANAGER - Frontend UI
// ============================================

const API_BASE = '';

// Game State - Portil HUD Compatible
const gameState = {
    resources: { funds: 5000, water: 1000, food: 1000, prestige: 100, staff: 50 },
    population: { total: 100, workers: 50, scientists: 20, guards: 10, nobles: 20, stress: 20 },
    family: { dynastyName: 'Casa Portil', ruler: { name: 'Archivist Vanya', role: 'Regente' }, legitimacy: 80, influence: 50 },
    government: { stability: 70, approval: 60 },
    army: { defense: 50, guards: 20, security: 50, power: 50, morale: 50, discipline: 50 },
    diplomacy: { reputation: 50 },
    events: { timeline: 0, day: 1, month: 'Cicloceno', year: 1020, hour: 8 },
    buildings: [],
    districts: [],
    riskLevel: 70,
    production: { water: 2, food: 2, funds: 1 },
    faith: 80,
    military: 50,
    timeSpeed: 1,
    isPaused: false,
    hasUnsavedChanges: false
};

// Resource variations tracking
const resourceVariations = {
    funds: 0,
    prestige: 0,
    faith: 0,
    military: 0
};

// Status trends
const statusTrends = {
    stability: 'up',
    approval: 'down'
};

// ============================================
// UI System - Portil HUD
// ============================================

function initUI() {
    loadGameData();
    setupHUDEvents();
    updateHUD();
    startGameLoop();
}

// ============================================
// HUD Events - Portil Style
// ============================================

function setupHUDEvents() {
    // Menu Button
    const menuBtn = document.getElementById('menuButton');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            openPanel('mainMenu');
        });
    }

    // Crest Medallion
    const crest = document.getElementById('crestMedallion');
    if (crest) {
        crest.addEventListener('click', () => {
            openPanel('house');
        });
    }

    // Time Control Buttons
    document.getElementById('btn-pause')?.addEventListener('click', () => setTimeSpeed(0));
    document.getElementById('btn-play')?.addEventListener('click', () => setTimeSpeed(1));
    document.getElementById('btn-fast')?.addEventListener('click', () => setTimeSpeed(2));
    document.getElementById('btn-veryfast')?.addEventListener('click', () => setTimeSpeed(4));

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
    showNotification('Partida Guardada', 'Tu progreso ha sido guardado exitosamente.');
}

function loadGame() {
    closePanel('mainMenu');
    showNotification('Cargar Partida', 'Cargando última partida guardada...');
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
    
    const notif = document.createElement('div');
    notif.className = `notification ${critical ? 'critical' : ''}`;
    notif.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${title}</span>
            <span class="notification-time">Ahora</span>
        </div>
        <div class="notification-content">${content}</div>
    `;
    
    container.appendChild(notif);
    notif.classList.add('active');
    
    setTimeout(() => {
        notif.classList.remove('active');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
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
}

function updateHUD() {
    // Update resource cards
    const moneyEl = document.getElementById('resource-money');
    if (moneyEl) moneyEl.textContent = gameState.resources.funds;
    
    const prestigeEl = document.getElementById('resource-prestige');
    if (prestigeEl) prestigeEl.textContent = gameState.resources.prestige;
    
    const faithEl = document.getElementById('resource-faith');
    if (faithEl) faithEl.textContent = gameState.faith;
    
    const militaryEl = document.getElementById('resource-military');
    if (militaryEl) militaryEl.textContent = gameState.military;

    // Update variations
    updateVariation('variation-money', resourceVariations.funds);
    updateVariation('variation-prestige', resourceVariations.prestige);
    updateVariation('variation-faith', resourceVariations.faith);
    updateVariation('variation-military', resourceVariations.military);

    // Update calendar/time display
    const dayEl = document.getElementById('day-display');
    if (dayEl) dayEl.textContent = gameState.events.day || 1;
    
    const monthEl = document.getElementById('month-display');
    if (monthEl) monthEl.textContent = `${gameState.events.month || 'Cicloceno'}, ${gameState.events.year || 1020}`;
    
    const hourEl = document.getElementById('hour-display');
    if (hourEl) hourEl.textContent = String(gameState.events.hour || 8).padStart(2, '0') + ':00';

    // Update stability meter
    updateStatusMeter('stability', gameState.government.stability);
    updateStatusMeter('approval', gameState.government.approval);

    // Update menu button unsaved indicator
    const menuBtn = document.getElementById('menuButton');
    if (menuBtn) {
        if (gameState.hasUnsavedChanges) {
            menuBtn.classList.add('has-unsaved');
        } else {
            menuBtn.classList.remove('has-unsaved');
        }
    }
}

function updateVariation(elementId, variation) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const sign = variation >= 0 ? '+' : '';
    el.textContent = sign + variation;
    
    el.classList.remove('positive', 'negative');
    if (variation > 0) el.classList.add('positive');
    else if (variation < 0) el.classList.add('negative');
}

function updateStatusMeter(type, value) {
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
// IA System - Funciones de control
// ============================================

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateAI() {
    if (gameState.isPaused) return;
    
    const pop = gameState.population;
    const res = gameState.resources;
    const gov = gameState.government;
    const army = gameState.army;
    const fam = gameState.family;
    
    // Track previous values for variation calculation
    const prevFunds = res.funds;
    const prevPrestige = res.prestige;
    const prevFaith = gameState.faith;
    const prevMilitary = gameState.military;
    
    let waterProduction = 2;
    let foodProduction = 2;
    let fundsProduction = 1;
    
    for (const building of gameState.buildings) {
        if (building.isBuilt && building.effects) {
            if (building.effects.waterGeneration) waterProduction += building.effects.waterGeneration;
            if (building.effects.foodGeneration) foodProduction += building.effects.foodGeneration;
            if (building.effects.fundsGeneration) fundsProduction += building.effects.fundsGeneration;
        }
    }
    
    const waterConsumption = Math.floor(pop.total * 0.1);
    const foodConsumption = Math.floor(pop.total * 0.1);
    
    res.water = clamp(res.water + waterProduction - waterConsumption, 0, 9999);
    res.food = clamp(res.food + foodProduction - foodConsumption, 0, 9999);
    res.funds = clamp(res.funds + fundsProduction + randomRange(-2, 3), 0, 999999);
    res.prestige = clamp(res.prestige + randomRange(-1, 1), 0, 100);
    
    pop.workers = clamp(pop.workers + randomRange(-1, 1), 0, pop.total);
    pop.total = clamp(pop.total + randomRange(-1, 1), 10, 500);
    pop.scientists = clamp(pop.scientists + randomRange(-1, 1), 0, 50);
    pop.guards = clamp(pop.guards + randomRange(-1, 1), 0, 100);
    pop.nobles = clamp(pop.nobles + randomRange(0, 1), 0, 30);
    pop.stress = clamp(pop.stress + randomRange(-1, 1), 0, 100);
    
    fam.influence = clamp(fam.influence + randomRange(-1, 1), 0, 100);
    fam.legitimacy = clamp(fam.legitimacy + randomRange(-1, 1), 0, 100);
    
    // Track previous status values
    const prevStability = gov.stability;
    const prevApproval = gov.approval;
    
    gov.stability = clamp(gov.stability + randomRange(-1, 1), 0, 100);
    gov.approval = clamp(gov.approval + randomRange(-1, 1), 0, 100);
    
    // Update status trends
    statusTrends.stability = gov.stability >= prevStability ? 'up' : 'down';
    statusTrends.approval = gov.approval >= prevApproval ? 'up' : 'down';
    
    army.defense = clamp(army.defense + randomRange(-1, 1), 0, 100);
    army.power = clamp(army.power + randomRange(-1, 1), 0, 100);
    army.morale = clamp(army.morale + randomRange(-1, 1), 0, 100);
    army.discipline = clamp(army.discipline + randomRange(-1, 1), 0, 100);
    army.security = clamp(army.security + randomRange(-1, 1), 0, 100);
    
    gameState.faith = clamp(gameState.faith + randomRange(-1, 1), 0, 100);
    gameState.military = clamp(gameState.military + randomRange(-1, 1), 0, 100);
    gameState.diplomacy.reputation = clamp(gameState.diplomacy.reputation + randomRange(-1, 1), 0, 100);
    
    gameState.riskLevel = clamp(gameState.riskLevel + randomRange(-2, 2), 0, 100);
    
    // Calculate variations per tick
    resourceVariations.funds = res.funds - prevFunds;
    resourceVariations.prestige = res.prestige - prevPrestige;
    resourceVariations.faith = gameState.faith - prevFaith;
    resourceVariations.military = gameState.military - prevMilitary;
    
    if (randomRange(0, 20) === 1) {
        const eventType = randomRange(0, 2);
        if (eventType === 0) {
            res.prestige = clamp(res.prestige + 2, 0, 100);
        } else if (eventType === 1) {
            res.funds = clamp(res.funds + 5, 0, 999999);
        } else {
            res.food = clamp(res.food - 3, 0, 9999);
        }
    }
    
    gameState.events.timeline++;
    
    // Update time based on speed
    gameState.events.hour += gameState.timeSpeed;
    if (gameState.events.hour >= 24) {
        gameState.events.hour = 0;
        gameState.events.day++;
        
        if (gameState.events.day > 30) {
            gameState.events.day = 1;
            // Cycle through months
            const months = ['Cicloceno', 'Deshielo', 'Sequía', 'Aridez', 'Vendaval'];
            const currentIdx = months.indexOf(gameState.events.month);
            gameState.events.month = months[(currentIdx + 1) % months.length];
            
            if (currentIdx === 4) {
                gameState.events.year++;
            }
        }
    }
    
    updateHUD();
}

// ============================================
// Game Loop
// ============================================

let gameLoopInterval = null;
let aiLoopInterval = null;

function startGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (aiLoopInterval) clearInterval(aiLoopInterval);
    
    // Base update interval: 2 seconds
    // Adjusted by timeSpeed for faster simulation
    const baseInterval = 2000;
    aiLoopInterval = setInterval(updateAI, baseInterval);
    
    // Sync with server less frequently
    gameLoopInterval = setInterval(gameTick, 5000);
}

async function gameTick() {
    try {
        await fetch(`${API_BASE}/api/hydraulic/tick`, { method: 'POST' });
        await loadGameData();
        updateAllUI();
    } catch (e) {
        console.log('Modo offline - IA activa');
    }
}

// ============================================
// Initialize - Portil HUD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const startScreen = document.getElementById('startScreen');
    const hudRoot = document.getElementById('hudRoot');
    const btnNewGame = document.getElementById('btnNewGame');
    
    if (btnNewGame && startScreen && hudRoot) {
        btnNewGame.addEventListener('click', function() {
            startScreen.style.display = 'none';
            initUI();
        });
    } else {
        initUI();
    }
});