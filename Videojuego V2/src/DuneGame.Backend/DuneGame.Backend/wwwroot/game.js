// ============================================
// DUNE: THE MEASURE - Casa Portil
// Frontend JavaScript - Modelo Unificado
// ============================================

const API_BASE = '';

// ============================================
// Estado del Juego - Recursos Unificados
// ============================================
const gameState = {
    // Recursos primarios HUD
    solari: 5000,
    agua: 1000,
    comida: 800,
    plastiacero: 200,
    cuadros: 50,
    
    // Recursos secundarios
    sellos: 20,
    registros: 150,
    melange: 5,
    creditoLandraad: 75,
    participacionesChoam: 15,
    
    // Indicadores
    tension: 70,
    ronda: 1,
    tiempo: 0,
    
    // Flags
    isPaused: false,
    hasUnsavedChanges: false
};

// Recursos con variaciones
const resourceVariations = {
    solari: 0,
    agua: 0,
    comida: 0,
    plastiacero: 0,
    cuadros: 0
};

// ============================================
// Datos del Sistema
// ============================================
const enclaves = [
    { id: 'palacio', name: 'Distrito del Palacio', icon: '🏛️', tension: 45, population: 50, water: 200, built: ['planta_agua', 'archivo', 'biocontrol'] },
    { id: 'comercio', name: 'Distrito Comercial', icon: '🏪', tension: 65, population: 30, water: 80, built: ['almacen', 'patio'] },
    { id: 'investigacion', name: 'Distrito Científico', icon: '🔬', tension: 80, population: 20, water: 50, built: ['laboratorio', 'mentat'] }
];

const buildings = [
    // Infraestructura
    { id: 'planta_agua', name: 'Planta de Recuperación Hídrica', category: 'infra', sub: 'infraestructura', cost: { solari: 1000, plastiacero: 100 }, outputs: { agua: 50 }, built: true, req: null },
    { id: 'cisterna', name: 'Cisterna Mayor', category: 'infra', sub: 'infraestructura', cost: { solari: 600, plastiacero: 80 }, outputs: { agua: 30 }, built: false, req: 'planta_agua' },
    { id: 'filtrado', name: 'Red de Filtrado Salino', category: 'infra', sub: 'infraestructura', cost: { solari: 400, plastiacero: 50 }, outputs: { agua: 20 }, built: false, req: 'planta_agua' },
    
    // Logística
    { id: 'almacen', name: 'Almacén de Estiba', category: 'log', sub: 'logistica', cost: { solari: 400, plastiacero: 30 }, outputs: { stock: 100 }, built: false, req: null },
    { id: 'deposito', name: 'Depósito de Plastiacero', category: 'log', sub: 'logistica', cost: { solari: 300 }, outputs: { stock: 50 }, built: false, req: null },
    { id: 'patio', name: 'Patio de Transferencia', category: 'log', sub: 'logistica', cost: { solari: 500, agua: 20 }, outputs: { eficiencia: 15 }, built: false, req: null },
    
    // Custodia
    { id: 'transito', name: 'Cámara de Tránsito', category: 'cust', sub: 'custodia', cost: { solari: 800, sellos: 10 }, outputs: { stress: -10 }, built: false, req: null },
    { id: 'cuarentena', name: 'Patio de Cuarentena', category: 'cust', sub: 'custodia', cost: { solari: 600, sellos: 15 }, outputs: { contención: 20 }, built: false, req: null },
    { id: 'anillo', name: 'Anillo de Custodia', category: 'cust', sub: 'custodia', cost: { solari: 1000, sellos: 20 }, outputs: { fuga: -15 }, built: false, req: null },
    { id: 'linea', name: 'Cámara de Línea Sensible', category: 'cust', sub: 'custodia', cost: { solari: 500, sellos: 5 }, outputs: { riesgo: 10 }, built: false, req: 'anillo' },
    
    // Ciencia
    { id: 'biocontrol', name: 'Casa de Biocontrol', category: 'sci', sub: 'ciencia', cost: { solari: 1500, cuadros: 10, registros: 20 }, outputs: { diagnóstico: 1 }, built: true, req: null },
    { id: 'archivo', name: 'Archivo de Caudales', category: 'sci', sub: 'ciencia', cost: { solari: 600, cuadros: 5 }, outputs: { registro: 10 }, built: true, req: null },
    { id: 'mentat', name: 'Cámara Mentat', category: 'sci', sub: 'ciencia', cost: { solari: 1200, registros: 30, cuadros: 5 }, outputs: { predicción: 1 }, built: false, req: 'archivo' },
    
    // Administración
    { id: 'aforos', name: 'Sala de Aforos', category: 'admin', sub: 'administracion', cost: { solari: 500, cuadros: 5 }, outputs: { licencia: 10 }, built: false, req: null },
    { id: 'choam', name: 'Oficina CHOAM', category: 'admin', sub: 'administracion', cost: { solari: 800, creditoLandraad: 10 }, outputs: { contrato: 1 }, built: false, req: null },
    
    // Protocolo
    { id: 'audiencia', name: 'Pabellón de Audiencia', category: 'prot', sub: 'protocolo', cost: { solari: 800, agua: 50, cuadros: 5 }, outputs: { audiencia: 50 }, built: false, req: null },
    { id: 'protocolo', name: 'Sala de Protocolo', category: 'prot', sub: 'protocolo', cost: { solari: 600, melange: 2 }, outputs: { prestigio: 15 }, built: false, req: 'audiencia' },
    { id: 'patrocinio', name: 'Terraza de Patrocinio', category: 'prot', sub: 'protocolo', cost: { solari: 400, agua: 30 }, outputs: { donacion: 20 }, built: false, req: null },
    
    // Seguridad
    { id: 'guardia', name: 'Cuartel de Guardapuertas', category: 'sec', sub: 'seguridad', cost: { solari: 600, cuadros: 10 }, outputs: { respuesta: 20 }, built: false, req: null },
    { id: 'vigilancia', name: 'Torre de Vigía', category: 'sec', sub: 'seguridad', cost: { solari: 400, plastiacero: 30 }, outputs: { alerta: 15 }, built: false, req: null },
    { id: 'sello', name: 'Compuerta de Sello', category: 'sec', sub: 'seguridad', cost: { solari: 500, sellos: 5 }, outputs: { seguridad: 20 }, built: false, req: null }
];

// Contratos
const contracts = [
    { id: 'choam', name: 'Acuerdo CHOAM', type: 'corporativo', parties: ['Portil', 'CHOAM'], value: 150, duration: 10, state: 'active', desc: 'Suministro exclusivo de especia' },
    { id: 'atreides', name: 'Pacto de-no Agresión', type: 'diplomatico', parties: ['Portil', 'Atreides'], value: 0, duration: 20, state: 'active', desc: 'Pacto defensivo mutuo' },
    { id: 'harks', name: 'Audiencia con Harkonnen', type: 'audiencia', parties: ['Portil', 'Harkonnen'], value: 200, duration: 1, state: 'pending', desc: 'Negociación de enclave' },
    { id: ' landsraad', name: 'Audiencia Imperial', type: 'audiencia', parties: ['Portil', 'Corrino'], value: 500, duration: 1, state: 'pending', desc: 'Solicitud de расширение territorial' }
];

// Custodia / Biológicos
const custodiaAssets = [
    { id: 'c1', name: 'Línea Alpha-7', class: 'Combatiente', costManten: 15, stability: 90, risk: 'low', enclave: 'palacio', estado: 'activa' },
    { id: 'c2', name: 'Línea Beta-3', class: 'Obrera', costManten: 8, stability: 75, risk: 'medium', enclave: 'comercio', estado: 'activa' },
    { id: 'c3', name: 'Línea Gamma-1', class: 'Especial', costManten: 25, stability: 60, risk: 'high', enclave: 'investigacion', estado: 'cuarentena' },
    { id: 'c4', name: 'Línea Delta-9', class: 'Obrera', costManten: 8, stability: 85, risk: 'low', enclave: 'comercio', estado: 'activa' }
];

// Crisis
const crisisList = [
    { 
        id: 'crisis_agua', 
        name: 'Contaminación de Acuífero', 
        severity: 'high', 
        desc: 'Se ha detectado contaminación en el acuífero principal del Distrito Comercial. La situación requiere atención inmediata.',
        options: [
            { id: 'op1', text: 'Ordenar cierre inmediato', cost: { solari: 200 }, damage: 0 },
            { id: 'op2', text: 'Investigar antes de actuar', cost: { registros: 10 }, damage: 15 },
            { id: 'op3', text: 'Ignorar (esperar)', cost: { solari: 0 }, damage: 30 }
        ]
    }
];

// Bitácora
const bitacora = [
    { ronda: 1, text: 'Partido iniciada', critical: false }
];

// ============================================
// Inicialización
// ============================================
function initUI() {
    setupEvents();
    updateAllUI();
    startGameLoop();
}

function setupEvents() {
    // Start button
    document.getElementById('btnNewGame')?.addEventListener('click', () => {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        initUI();
    });
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const vista = tab.dataset.vista;
            switchVista(vista);
            
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Sub-tabs (Obras)
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const sub = tab.dataset.sub;
            renderBuildingsBySub(sub);
            
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // Close round button
    document.getElementById('btn-close-round')?.addEventListener('click', closeRound);
}

// ============================================
// Navegación de Vistas
// ============================================
function switchVista(vistaName) {
    // Hide all vista panels
    document.querySelectorAll('.vista-panel').forEach(p => p.classList.add('hidden'));
    
    // Show selected vista
    const vista = document.getElementById(`vista-${vistaName}`);
    if (vista) {
        vista.classList.remove('hidden');
    }
    
    // Update inspector
    updateInspector(vistaName);
}

function updateInspector(vistaName) {
    const titleEl = document.getElementById('inspector-title');
    const subEl = document.getElementById('inspector-subtitle');
    const contentEl = document.getElementById('inspector-content');
    
    const inspectorData = {
        casa: {
            title: 'Casa Portil',
            subtitle: 'Estado institucional',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">ESTADO</div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Legitimidad</span>
                        <span class="inspector-stat-value">${gameState.creditoLandraad}%</span>
                    </div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Influencia</span>
                        <span class="inspector-stat-value">${gameState.participacionesChoam}%</span>
                    </div>
                </div>
                <div class="inspector-section">
                    <div class="inspector-section-title">RECURSOS DISPONIBLES</div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Solari</span>
                        <span class="inspector-stat-value">${gameState.solari}</span>
                    </div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Sellos</span>
                        <span class="inspector-stat-value">${gameState.sellos}</span>
                    </div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Melange</span>
                        <span class="inspector-stat-value">${gameState.melange}</span>
                    </div>
                </div>
            `
        },
        enclaves: {
            title: 'Enclaves',
            subtitle: 'Seleccione un nodo',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">GUÍA</div>
                    <div style="font-size: 12px; color: var(--plata-fluvial); line-height: 1.6;">
                        Haga clic en un nodo del mapa para ver sus detalles.
                    </div>
                </div>
            `
        },
        obras: {
            title: 'Obras',
            subtitle: 'Construcciones',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">SELECCIÓN</div>
                    <div style="font-size: 12px; color: var(--plata-fluvial); line-height: 1.6;">
                        Seleccione un edificio para ver requisitos y efectos.
                    </div>
                </div>
            `
        },
        hacienda: {
            title: 'Hacienda',
            subtitle: 'Estado económico',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">PROYECCIÓN</div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">1 ronda</span>
                        <span class="inspector-stat-value" style="color: var(--verde-estuario);">${gameState.solari + 140}</span>
                    </div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">3 rondas</span>
                        <span class="inspector-stat-value" style="color: var(--verde-estuario);">${gameState.solari + 420}</span>
                    </div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">6 rondas</span>
                        <span class="inspector-stat-value" style="color: var(--plata-fluvial);">${gameState.solari + 840}</span>
                    </div>
                </div>
            `
        },
        contratos: {
            title: 'Contratos',
            subtitle: 'Negociaciones',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">REQUISITOS</div>
                    <div style="font-size: 12px; color: var(--plata-fluvial); line-height: 1.6;">
                        Seleccione un contrato para ver detalles.
                    </div>
                </div>
            `
        },
        custodia: {
            title: 'Custodia',
            subtitle: 'Activos biológicos',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">COSTE TOTAL</div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Mantenimiento</span>
                        <span class="inspector-stat-value">${custodiaAssets.reduce((a, c) => a + c.costManten, 0)}/ronda</span>
                    </div>
                </div>
            `
        },
        archivo: {
            title: 'Archivo',
            subtitle: 'Datos y análisis',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">MÉTRICAS</div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Registros</span>
                        <span class="inspector-stat-value">${gameState.registros}</span>
                    </div>
                    <div class="inspector-stat">
                        <span class="inspector-stat-label">Tendencia</span>
                        <span class="inspector-stat-value" style="color: var(--amber-critico);">↑</span>
                    </div>
                </div>
            `
        },
        crisis: {
            title: 'Crisis',
            subtitle: 'Eventos activos',
            content: `
                <div class="inspector-section">
                    <div class="inspector-section-title">ESTADO</div>
                    <div style="font-size: 12px; color: var(--plata-fluvial); line-height: 1.6;">
                        Seleccione una opción de respuesta.
                    </div>
                </div>
            `
        }
    };
    
    const data = inspectorData[vistaName] || inspectorData.casa;
    titleEl.textContent = data.title;
    subEl.textContent = data.subtitle;
    contentEl.innerHTML = data.content;
}

// ============================================
// Renderizado de Contenido
// ============================================
function renderEnclaves() {
    const mapContainer = document.getElementById('nodeMap');
    if (!mapContainer) return;
    
    const positions = [
        { x: 50, y: 30 },
        { x: 25, y: 60 },
        { x: 75, y: 60 }
    ];
    
    mapContainer.innerHTML = enclaves.map((enclave, i) => {
        const pos = positions[i];
        let tensionClass = 'low';
        if (enclave.tension >= 70) tensionClass = 'high';
        else if (enclave.tension >= 50) tensionClass = 'medium';
        
        return `
            <div class="node" style="left: ${pos.x}%; top: ${pos.y}%; transform: translate(-50%, -50%);" onclick="selectEnclave('${enclave.id}')">
                <div class="node-icon">${enclave.icon}</div>
                <div class="node-name">${enclave.name.split(' ')[0]}</div>
                <div class="node-tension ${tensionClass}">${enclave.tension}</div>
            </div>
        `;
    }).join('');
}

function renderBuildingsBySub(sub) {
    const grid = document.getElementById('buildingsGrid');
    if (!grid) return;
    
    const filtered = buildings.filter(b => b.sub === sub);
    
    grid.innerHTML = filtered.map(b => {
        const isLocked = !isBuildingAvailable(b);
        const isBuilt = b.built;
        
        let costHTML = [];
        if (b.cost.solari) costHTML.push(`<span class="building-cost solari">💰 ${b.cost.solari}</span>`);
        if (b.cost.agua) costHTML.push(`<span class="building-cost water">💧 ${b.cost.agua}</span>`);
        if (b.cost.plastiacero) costHTML.push(`<span class="building-cost plastiacero">⚙️ ${b.cost.plastiacero}</span>`);
        if (b.cost.sellos) costHTML.push(`<span class="building-cost sellos">🔒 ${b.cost.sellos}</span>`);
        if (b.cost.cuadros) costHTML.push(`<span class="building-cost cuadros">👥 ${b.cost.cuadros}</span>`);
        
        let effectsHTML = [];
        if (b.outputs.agua) effectsHTML.push(`+${b.outputs.agua} agua`);
        if (b.outputs.stock) effectsHTML.push(`+${b.outputs.stock} stock`);
        if (b.outputs.stress) effectsHTML.push(`${b.outputs.stress} estrés`);
        if (b.outputs.contencion) effectsHTML.push(`+${b.outputs.contencion} contención`);
        if (b.outputs.fuga) effectsHTML.push(`${b.outputs.fuga} fuga`);
        if (b.outputs.registro) effectsHTML.push(`+${b.outputs.registro} registros`);
        if (b.outputs.audiencia) effectsHTML.push(`+${b.outputs.audiencia} audiencia`);
        
        return `
            <div class="building-card ${isBuilt ? 'built' : ''} ${isLocked ? 'locked' : ''}" onclick="${!isBuilt && !isLocked ? `buildBuilding('${b.id}')` : ''}">
                <div class="building-header">
                    <span class="building-name">${b.name}</span>
                    <span class="building-category">${b.category}</span>
                </div>
                <div class="building-costs">${costHTML.join('')}</div>
                ${effectsHTML.length ? `<div class="building-effects">${effectsHTML.join(', ')}</div>` : ''}
                <div class="building-status ${isBuilt ? 'built' : isLocked ? 'locked' : ''}">
                    ${isBuilt ? '✓ Construido' : isLocked ? '🔒 Bloqueado' : 'Disponible'}
                </div>
            </div>
        `;
    }).join('');
}

function renderContracts() {
    const list = document.getElementById('contractsList');
    if (!list) return;
    
    list.innerHTML = contracts.map(c => `
        <div class="contract-card">
            <div class="contract-header">
                <span class="contract-name">${c.name}</span>
                <span class="contract-state ${c.state}">${c.state === 'active' ? 'Activo' : c.state === 'pending' ? 'Pendiente' : 'Expirado'}</span>
            </div>
            <div class="contract-parties">
                ${c.parties.join(' ↔ ')}
            </div>
            <div style="font-size: 11px; color: var(--plata-fluvial); opacity: 0.7; margin-bottom: 8px;">${c.desc}</div>
            ${c.value > 0 ? `<div class="contract-value">+${c.value} Solari/ronda</div>` : ''}
        </div>
    `).join('');
}

function renderCustodia() {
    const grid = document.getElementById('custodiaGrid');
    if (!grid) return;
    
    grid.innerHTML = custodiaAssets.map(c => `
        <div class="custodia-card">
            <div class="custodia-header">
                <span class="custodia-class">${c.class}</span>
                <span class="custodia-risk ${c.risk}">${c.risk === 'high' ? 'Alto' : c.risk === 'medium' ? 'Medio' : 'Bajo'}</span>
            </div>
            <div style="font-family: Cinzel; color: var(--plata-clara); font-size: 13px; margin-bottom: 8px;">${c.name}</div>
            <div class="custodia-stats">
                <span><span class="custodia-stat-label">Coste:</span> <span class="custodia-stat-value">${c.costManten}</span></span>
                <span><span class="custodia-stat-label">Estabilidad:</span> <span class="custodia-stat-value">${c.stability}%</span></span>
            </div>
            <div style="font-size: 10px; color: var(--plata-fluvial); opacity: 0.7; margin-top: 8px;">Estado: ${c.estado}</div>
        </div>
    `).join('');
}

function renderCrisis() {
    const list = document.getElementById('crisisList');
    if (!list) return;
    
    if (crisisList.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--plata-fluvial); opacity: 0.6;">
                <div style="font-size: 32px; margin-bottom: 16px;">✓</div>
                <div>No hay crisis activas</div>
            </div>
        `;
        return;
    }
    
    list.innerHTML = crisisList.map(c => `
        <div class="crisis-card">
            <div class="crisis-header">
                <span class="crisis-title">${c.name}</span>
                <span class="crisis-severity">${c.severity.toUpperCase()}</span>
            </div>
            <div class="crisis-desc">${c.desc}</div>
            <div class="crisis-options">
                ${c.options.map(opt => `
                    <div class="crisis-option" onclick="resolveCrisis('${c.id}', '${opt.id}')">
                        <span>${opt.text}</span>
                        <span class="crisis-option-cost">
                            ${Object.entries(opt.cost).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ============================================
// Lógica del Juego
// ============================================
function isBuildingAvailable(building) {
    if (!building.req) return true;
    const reqBuilding = buildings.find(b => b.id === building.req);
    return reqBuilding && reqBuilding.built;
}

function buildBuilding(buildingId) {
    const building = buildings.find(b => b.id === buildingId);
    if (!building || building.built || !isBuildingAvailable(building)) return;
    
    // Check costs
    if ((building.cost.solari || 0) > gameState.solari) {
        alert('Solari insuficientes');
        return;
    }
    if ((building.cost.plastiacero || 0) > gameState.plastiacero) {
        alert('Plastiacero insuficiente');
        return;
    }
    if ((building.cost.agua || 0) > gameState.agua) {
        alert('Agua insuficiente');
        return;
    }
    if ((building.cost.sellos || 0) > gameState.sellos) {
        alert('Sellos insuficientes');
        return;
    }
    if ((building.cost.cuadros || 0) > gameState.cuadros) {
        alert('Cuadros insuficientes');
        return;
    }
    
    // Deduct costs
    gameState.solari -= (building.cost.solari || 0);
    gameState.plastiacero -= (building.cost.plastiacero || 0);
    gameState.agua -= (building.cost.agua || 0);
    gameState.sellos -= (building.cost.sellos || 0);
    gameState.cuadros -= (building.cost.cuadros || 0);
    
    // Mark as built
    building.built = true;
    
    // Update outputs
    if (building.outputs.agua) gameState.agua += building.outputs.agua;
    
    // Add bitácora entry
    addBitacoraEntry(`Construido: ${building.name}`);
    
    // Update UI
    updateAllUI();
    
    // Re-render buildings
    const activeSub = document.querySelector('.sub-tab.active')?.dataset.sub || 'infra';
    renderBuildingsBySub(activeSub);
}

function selectEnclave(enclaveId) {
    const enclave = enclaves.find(e => e.id === enclaveId);
    if (!enclave) return;
    
    // Update inspector
    const titleEl = document.getElementById('inspector-title');
    const subEl = document.getElementById('inspector-subtitle');
    const contentEl = document.getElementById('inspector-content');
    
    titleEl.textContent = enclave.name;
    subEl.textContent = 'Enclave seleccionado';
    contentEl.innerHTML = `
        <div class="inspector-section">
            <div class="inspector-section-title">ESTADO</div>
            <div class="inspector-stat">
                <span class="inspector-stat-label">Tensión</span>
                <span class="inspector-stat-value" style="color: ${enclave.tension >= 70 ? 'var(--amber-critico)' : 'var(--plata-clara)'};">${enclave.tension}%</span>
            </div>
            <div class="inspector-stat">
                <span class="inspector-stat-label">Población</span>
                <span class="inspector-stat-value">${enclave.population}</span>
            </div>
            <div class="inspector-stat">
                <span class="inspector-stat-label">Agua</span>
                <span class="inspector-stat-value">${enclave.water}</span>
            </div>
        </div>
        <div class="inspector-section">
            <div class="inspector-section-title">EDIFICIOS</div>
            ${enclave.built.map(bid => {
                const b = buildings.find(b => b.id === bid);
                return b ? `<div style="font-size: 12px; color: var(--plata-clara); padding: 4px 0;">✓ ${b.name}</div>` : '';
            }).join('')}
        </div>
    `;
    
    // Mark node as selected
    document.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
    event.target.closest('.node')?.classList.add('selected');
}

function resolveCrisis(crisisId, optionId) {
    const crisis = crisisList.find(c => c.id === crisisId);
    if (!crisis) return;
    
    const option = crisis.options.find(o => o.id === optionId);
    if (!option) return;
    
    // Apply costs
    gameState.solari -= (option.cost.solari || 0);
    gameState.registros -= (option.cost.registros || 0);
    
    // Update tension based on damage
    gameState.tension = Math.max(0, gameState.tension - (option.damage || 0));
    
    // Remove crisis
    const idx = crisisList.findIndex(c => c.id === crisisId);
    if (idx >= 0) crisisList.splice(idx, 1);
    
    // Add bitácora
    addBitacoraEntry(`Crisis resuelta: ${option.text}`);
    
    // Update UI
    updateAllUI();
    renderCrisis();
}

function closeRound() {
    gameState.ronda++;
    addBitacoraEntry(`Ronda ${gameState.ronda} cerrada`);
    
    // Simulate resources changes
    const prevSolari = gameState.solari;
    gameState.solari += 140;
    gameState.registros += 5;
    
    resourceVariations.solari = gameState.solari - prevSolari;
    
    // Random events
    if (Math.random() < 0.2) {
        gameState.tension = Math.min(100, gameState.tension + 5);
    }
    
    updateAllUI();
}

// ============================================
// Actualización de UI
// ============================================
function updateAllUI() {
    // Update HUD
    document.getElementById('hud-solari').textContent = gameState.solari;
    document.getElementById('hud-agua').textContent = gameState.agua;
    document.getElementById('hud-comida').textContent = gameState.comida;
    document.getElementById('hud-plastiacero').textContent = gameState.plastiacero;
    document.getElementById('hud-cuadros').textContent = gameState.cuadros;
    
    // Update tension
    document.getElementById('tension-bar').style.width = gameState.tension + '%';
    document.getElementById('tension-value').textContent = gameState.tension + '%';
    
    const tensionBar = document.getElementById('tension-bar');
    tensionBar.classList.remove('warning', 'critical');
    if (gameState.tension >= 70) tensionBar.classList.add('critical');
    else if (gameState.tension >= 50) tensionBar.classList.add('warning');
    
    // Update Casa stats
    document.getElementById('credito-landraad').textContent = gameState.creditoLandraad;
    document.getElementById('participaciones-choam').textContent = gameState.participacionesChoam + '%';
    document.getElementById('enclaves-activos').textContent = enclaves.length;
    document.getElementById('obras-activas').textContent = buildings.filter(b => b.built).length;
    
    // Update Hacienda
    document.getElementById('flow-ingresos').textContent = '320';
    document.getElementById('flow-caja').textContent = gameState.solari;
    document.getElementById('flow-gastos').textContent = '180';
    document.getElementById('ingreso-ronda').textContent = '+320';
    document.getElementById('gasto-ronda').textContent = '-180';
    document.getElementById('balance-neto').textContent = '+140';
    
    // Update Enclaves
    renderEnclaves();
    
    // Update buildings
    renderBuildingsBySub('infraestructura');
    
    // Update contracts
    renderContracts();
    
    // Update custodia
    renderCustodia();
    
    // Update crisis
    renderCrisis();
    
    // Update round
    document.getElementById('round-number').textContent = gameState.ronda;
}

function addBitacoraEntry(text, critical = false) {
    const timeline = document.getElementById('bitacora-timeline');
    if (!timeline) return;
    
    bitacora.unshift({ ronda: gameState.ronda, text, critical });
    
    const entry = document.createElement('div');
    entry.className = `bitacora-entry ${critical ? 'critical' : ''}`;
    entry.innerHTML = `
        <span class="bitacora-time">R${gameState.ronda}</span>
        <span class="bitacora-event">${text}</span>
    `;
    
    timeline.insertBefore(entry, timeline.firstChild);
}

// ============================================
// Game Loop
// ============================================
let gameLoopInterval = null;

function startGameLoop() {
    // Update every 3 seconds (simulation tick)
    gameLoopInterval = setInterval(() => {
        // Random resource variations
        gameState.agua = Math.max(0, gameState.agua + Math.floor(Math.random() * 6) - 2);
        gameState.comida = Math.max(0, gameState.comida + Math.floor(Math.random() * 4) - 2);
        
        // Random tension changes
        if (Math.random() < 0.1) {
            gameState.tension = Math.max(0, Math.min(100, gameState.tension + (Math.random() > 0.5 ? 1 : -1)));
        }
        
        updateAllUI();
    }, 3000);
}

// ============================================
// Botón de inicio
// ============================================
function iniciarPartido() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('appContainer').classList.remove('hidden');
    initUI();
}

// Ocultar start screen al cargar
document.getElementById('startScreen').style.display = 'none';
document.getElementById('appContainer').classList.remove('hidden');
initUI();