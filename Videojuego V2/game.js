// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    TILE_SIZE: 40,
    PLAYER_SPEED: 3,
    WORLD_WIDTH: 3000,
    WORLD_HEIGHT: 2000,
    MAX_WATER: 100,
    STARTING_CREDITS: 500
};

// Game State
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    DIALOGUE: 'dialogue',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');
minimapCanvas.width = 150;
minimapCanvas.height = 150;

// Game variables
let currentState = GameState.MENU;
let camera = { x: 0, y: 0 };
let keys = {};
let gameTime = 0;

// Player
const player = {
    x: CONFIG.WORLD_WIDTH / 2,
    y: CONFIG.WORLD_HEIGHT / 2,
    width: 30,
    height: 30,
    speed: CONFIG.PLAYER_SPEED,
    water: CONFIG.MAX_WATER,
    credits: CONFIG.STARTING_CREDITS,
    inventory: [],
    direction: 'down',
    animFrame: 0,
    animTimer: 0,
    isMoving: false
};

// World tiles
const TILE_TYPES = {
    DESERT: { color: '#c9a66b', name: 'Desert' },
    ROCK: { color: '#8b7355', name: 'Rocky Terrain' },
    WATER: { color: '#4a90e2', name: 'Water Source' },
    PALACE: { color: '#d4af37', name: 'Palace' },
    SIETCH: { color: '#a0826d', name: 'Sietch' },
    STATION: { color: '#6b8e9b', name: 'Measurement Station' },
    PALM: { color: '#228b22', name: 'Palm Grove' }
};

// Generate world map
const worldMap = generateWorldMap();

function generateWorldMap() {
    const map = [];
    const mapWidth = Math.ceil(CONFIG.WORLD_WIDTH / CONFIG.TILE_SIZE);
    const mapHeight = Math.ceil(CONFIG.WORLD_HEIGHT / CONFIG.TILE_SIZE);
    
    for (let y = 0; y < mapHeight; y++) {
        map[y] = [];
        for (let x = 0; x < mapWidth; x++) {
            // Create interesting terrain patterns
            const centerX = mapWidth / 2;
            const centerY = mapHeight / 2;
            const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            
            if (distFromCenter < 5) {
                map[y][x] = 'PALACE';
            } else if (distFromCenter < 15 && Math.random() < 0.3) {
                map[y][x] = 'PALM';
            } else if (Math.random() < 0.1) {
                map[y][x] = 'WATER';
            } else if (Math.random() < 0.2) {
                map[y][x] = 'ROCK';
            } else if (Math.random() < 0.05) {
                map[y][x] = 'STATION';
            } else {
                map[y][x] = 'DESERT';
            }
        }
    }
    
    // Add some sietches scattered around
    for (let i = 0; i < 10; i++) {
        const sx = Math.floor(Math.random() * mapWidth);
        const sy = Math.floor(Math.random() * mapHeight);
        map[sy][sx] = 'SIETCH';
    }
    
    return map;
}

// NPCs
const npcs = [
    {
        id: 'archivist',
        name: 'Archivist Vanya',
        x: CONFIG.WORLD_WIDTH / 2 - 100,
        y: CONFIG.WORLD_HEIGHT / 2 - 100,
        width: 30,
        height: 30,
        color: '#9b59b6',
        dialogues: [
            "Welcome to the Living Archive, agent. Our water records are incomplete.",
            "We need you to measure the water levels at the northern stations.",
            "The Rito del Rio ceremony approaches. Will you be ready?",
            "Remember: water is life. Our measurements keep Casa Portil strong."
        ],
        currentDialogue: 0,
        quest: {
            id: 'measure_stations',
            title: 'Measure the Water Stations',
            description: 'Visit 3 water measurement stations and record the levels',
            progress: 0,
            required: 3,
            reward: { water: 20, credits: 100 }
        }
    },
    {
        id: 'captain',
        name: 'Captain Cael',
        x: CONFIG.WORLD_WIDTH / 2 + 150,
        y: CONFIG.WORLD_HEIGHT / 2 - 50,
        width: 30,
        height: 30,
        color: '#e74c3c',
        dialogues: [
            "The desert holds many dangers. Rival houses watch us closely.",
            "Stay vigilant. The water convoys need protection.",
            "I've heard whispers of sabotage at the western stations.",
            "Your service to Casa Portil honors the Rito del Rio."
        ],
        currentDialogue: 0,
        quest: {
            id: 'protect_convoys',
            title: 'Protect Water Convoys',
            description: 'Defeat 5 threats attacking water convoys',
            progress: 0,
            required: 5,
            reward: { water: 30, credits: 150 }
        }
    },
    {
        id: 'merchant',
        name: 'Merchant Seris',
        x: CONFIG.WORLD_WIDTH / 2 + 100,
        y: CONFIG.WORLD_HEIGHT / 2 + 100,
        width: 30,
        height: 30,
        color: '#27ae60',
        dialogues: [
            "CHOAM trades flow through these sands. Water is our currency.",
            "I can offer fair trades: water for credits, or credits for supplies.",
            "The spice flows, but water... water is precious beyond measure.",
            "Come back when you have resources to trade."
        ],
        currentDialogue: 0,
        quest: null
    },
    {
        id: 'priest',
        name: 'Priestess Ilyna',
        x: CONFIG.WORLD_WIDTH / 2 - 150,
        y: CONFIG.WORLD_HEIGHT / 2 + 80,
        width: 30,
        height: 30,
        color: '#f39c12',
        dialogues: [
            "The Rito del Rio connects us to the ancient ways.",
            "Water must be measured with reverence, not greed.",
            "The Archive holds truths older than the Corrino dynasty.",
            "May the waters of Portil never run dry."
        ],
        currentDialogue: 0,
        quest: {
            id: 'rito_ceremony',
            title: 'Prepare the Rito del Rio',
            description: 'Collect sacred water from 5 holy sources',
            progress: 0,
            required: 5,
            reward: { water: 50, credits: 200 }
        }
    }
];

// Enemies
const enemies = [];
function spawnEnemies() {
    for (let i = 0; i < 15; i++) {
        enemies.push({
            id: i,
            x: Math.random() * CONFIG.WORLD_WIDTH,
            y: Math.random() * CONFIG.WORLD_HEIGHT,
            width: 25,
            height: 25,
            speed: 1.5,
            health: 3,
            maxHealth: 3,
            color: '#c0392b',
            direction: Math.random() * Math.PI * 2,
            changeTimer: 0,
            isAlive: true,
            type: 'rival_agent'
        });
    }
}
spawnEnemies();

// Water stations
const waterStations = [];
function generateWaterStations() {
    for (let i = 0; i < 8; i++) {
        waterStations.push({
            id: i,
            x: 200 + Math.random() * (CONFIG.WORLD_WIDTH - 400),
            y: 200 + Math.random() * (CONFIG.WORLD_HEIGHT - 400),
            width: 40,
            height: 40,
            waterLevel: Math.floor(Math.random() * 50) + 20,
            measured: false,
            color: '#3498db'
        });
    }
}
generateWaterStations();

// Quests
const activeQuests = [];
const completedQuests = [];

// Particles
const particles = [];

// Input handling
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ' && currentState === GameState.DIALOGUE) {
        advanceDialogue();
    }
    
    if (e.key === 'q' || e.key === 'Q') {
        toggleQuestLog();
    }
    
    if (e.key === 'Escape') {
        if (currentState === GameState.PLAYING) {
            currentState = GameState.PAUSED;
        } else if (currentState === GameState.PAUSED) {
            currentState = GameState.PLAYING;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Start game function
function startGame() {
    document.getElementById('mainMenu').style.display = 'none';
    currentState = GameState.PLAYING;
    gameLoop();
}

function showHelp() {
    alert(`Controls:
WASD or Arrow Keys - Move
SPACE - Interact/Continue dialogue
Q - Toggle quest log
ESC - Pause game

Objective:
Complete quests for Casa Portil, measure water stations, protect convoys, and participate in the sacred Rito del Rio ceremony. Water is your most precious resource - manage it wisely!`);
}

function showLore() {
    alert(`Casa Portil - House of Water Measurement

Casa Portil is a Minor House in the Dune universe, specializing in hydrological measurement, archive-based sovereignty, and water custody. Their devotion to the "Rito del Rio" (Ritual of the River) connects them to ancient water-worshipping traditions.

The Living Archive holds records older than the Corrino dynasty, and water measurement is both science and sacred duty. In this harsh desert world, water is life, and those who control water hold great power.

Navigate feudal politics, rival houses, and the ever-present danger of the deep desert as you serve Casa Portil.`);
}

// Update game state
function update() {
    if (currentState !== GameState.PLAYING) return;
    
    gameTime++;
    
    // Player movement
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy = -1;
    if (keys['s'] || keys['arrowdown']) dy = 1;
    if (keys['a'] || keys['arrowleft']) dx = -1;
    if (keys['d'] || keys['arrowright']) dx = 1;
    
    player.isMoving = dx !== 0 || dy !== 0;
    
    if (player.isMoving) {
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        const newX = player.x + dx * player.speed;
        const newY = player.y + dy * player.speed;
        
        // Check collision with world bounds
        if (newX >= 0 && newX <= CONFIG.WORLD_WIDTH - player.width) {
            player.x = newX;
        }
        if (newY >= 0 && newY <= CONFIG.WORLD_HEIGHT - player.height) {
            player.y = newY;
        }
        
        // Update direction for animation
        if (Math.abs(dx) > Math.abs(dy)) {
            player.direction = dx > 0 ? 'right' : 'left';
        } else {
            player.direction = dy > 0 ? 'down' : 'up';
        }
        
        // Animation
        player.animTimer++;
        if (player.animTimer > 10) {
            player.animFrame = (player.animFrame + 1) % 4;
            player.animTimer = 0;
        }
    }
    
    // Check NPC interactions
    if (keys[' ']) {
        checkNPCInteraction();
    }
    
    // Update camera
    camera.x = player.x - CONFIG.CANVAS_WIDTH / 2;
    camera.y = player.y - CONFIG.CANVAS_HEIGHT / 2;
    
    // Clamp camera
    camera.x = Math.max(0, Math.min(camera.x, CONFIG.WORLD_WIDTH - CONFIG.CANVAS_WIDTH));
    camera.y = Math.max(0, Math.min(camera.y, CONFIG.WORLD_HEIGHT - CONFIG.CANVAS_HEIGHT));
    
    // Update enemies
    updateEnemies();
    
    // Check water station measurement
    checkWaterStations();
    
    // Update particles
    updateParticles();
    
    // Spawn sand particles occasionally
    if (Math.random() < 0.1) {
        particles.push({
            x: camera.x + Math.random() * CONFIG.CANVAS_WIDTH,
            y: camera.y + Math.random() * CONFIG.CANVAS_HEIGHT,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 0.5 - 0.25,
            life: 100,
            size: Math.random() * 3 + 1,
            color: 'rgba(201, 166, 107, 0.5)'
        });
    }
    
    // Update HUD
    updateHUD();
}

function checkNPCInteraction() {
    for (let npc of npcs) {
        const dist = Math.sqrt((player.x - npc.x) ** 2 + (player.y - npc.y) ** 2);
        if (dist < 50) {
            startDialogue(npc);
            keys[' '] = false;
            return;
        }
    }
}

let currentNPC = null;
function startDialogue(npc) {
    currentNPC = npc;
    currentState = GameState.DIALOGUE;
    
    const dialogueBox = document.getElementById('dialogueBox');
    dialogueBox.style.display = 'block';
    dialogueBox.querySelector('.speaker').textContent = npc.name;
    dialogueBox.querySelector('.text').textContent = npc.dialogues[npc.currentDialogue];
    
    // Check if NPC has quest
    if (npc.quest && !activeQuests.find(q => q.id === npc.quest.id) && !completedQuests.find(q => q.id === npc.quest.id)) {
        setTimeout(() => {
            acceptQuest(npc.quest);
        }, 500);
    }
}

function advanceDialogue() {
    if (!currentNPC) return;
    
    currentNPC.currentDialogue = (currentNPC.currentDialogue + 1) % currentNPC.dialogues.length;
    
    const dialogueBox = document.getElementById('dialogueBox');
    dialogueBox.querySelector('.text').textContent = currentNPC.dialogues[currentNPC.currentDialogue];
    
    // Close dialogue after cycling through
    if (currentNPC.currentDialogue === 0) {
        dialogueBox.style.display = 'none';
        currentState = GameState.PLAYING;
        currentNPC = null;
    }
}

function acceptQuest(quest) {
    activeQuests.push({ ...quest });
    updateQuestLog();
    showNotification(`Quest accepted: ${quest.title}`);
}

function completeQuest(questId) {
    const questIndex = activeQuests.findIndex(q => q.id === questId);
    if (questIndex !== -1) {
        const quest = activeQuests[questIndex];
        completedQuests.push(quest);
        activeQuests.splice(questIndex, 1);
        
        // Give rewards
        player.water = Math.min(player.water + quest.reward.water, CONFIG.MAX_WATER);
        player.credits += quest.reward.credits;
        
        updateQuestLog();
        showNotification(`Quest completed: ${quest.title}! +${quest.reward.water}💧 +${quest.reward.credits}⚡`);
    }
}

function updateQuestProgress(questId, amount = 1) {
    for (let quest of activeQuests) {
        if (quest.id === questId && quest.progress < quest.required) {
            quest.progress += amount;
            if (quest.progress >= quest.required) {
                completeQuest(questId);
            }
            updateQuestLog();
        }
    }
}

function toggleQuestLog() {
    const questLog = document.getElementById('questLog');
    questLog.style.display = questLog.style.display === 'none' ? 'block' : 'none';
}

function updateQuestLog() {
    const questsDiv = document.querySelector('#questLog .quests');
    questsDiv.innerHTML = '';
    
    if (activeQuests.length === 0) {
        questsDiv.innerHTML = '<div class="quest-item">No active quests</div>';
        return;
    }
    
    for (let quest of activeQuests) {
        const div = document.createElement('div');
        div.className = 'quest-item';
        div.innerHTML = `
            <strong>${quest.title}</strong><br>
            ${quest.description}<br>
            Progress: ${quest.progress}/${quest.required}
        `;
        questsDiv.appendChild(div);
    }
}

function updateEnemies() {
    for (let enemy of enemies) {
        if (!enemy.isAlive) continue;
        
        // Random movement
        enemy.changeTimer--;
        if (enemy.changeTimer <= 0) {
            enemy.direction = Math.random() * Math.PI * 2;
            enemy.changeTimer = Math.random() * 100 + 50;
        }
        
        const newX = enemy.x + Math.cos(enemy.direction) * enemy.speed;
        const newY = enemy.y + Math.sin(enemy.direction) * enemy.speed;
        
        if (newX >= 0 && newX <= CONFIG.WORLD_WIDTH - enemy.width) {
            enemy.x = newX;
        }
        if (newY >= 0 && newY <= CONFIG.WORLD_HEIGHT - enemy.height) {
            enemy.y = newY;
        }
        
        // Check collision with player
        const dist = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
        if (dist < 30) {
            // Combat - simple system
            enemy.health--;
            player.water -= 2;
            
            // Knockback
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            player.x += Math.cos(angle) * 20;
            player.y += Math.sin(angle) * 20;
            
            // Damage particles
            for (let i = 0; i < 5; i++) {
                particles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.random() * 4 - 2,
                    vy: Math.random() * 4 - 2,
                    life: 30,
                    size: 3,
                    color: '#e74c3c'
                });
            }
            
            if (enemy.health <= 0) {
                enemy.isAlive = false;
                player.credits += 20;
                updateQuestProgress('protect_convoys');
                
                // Death particles
                for (let i = 0; i < 10; i++) {
                    particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: Math.random() * 6 - 3,
                        vy: Math.random() * 6 - 3,
                        life: 50,
                        size: 4,
                        color: '#c0392b'
                    });
                }
                
                // Respawn enemy after delay
                setTimeout(() => {
                    enemy.isAlive = true;
                    enemy.health = enemy.maxHealth;
                    enemy.x = Math.random() * CONFIG.WORLD_WIDTH;
                    enemy.y = Math.random() * CONFIG.WORLD_HEIGHT;
                }, 10000);
            }
        }
    }
}

function checkWaterStations() {
    for (let station of waterStations) {
        const dist = Math.sqrt((player.x - station.x) ** 2 + (player.y - station.y) ** 2);
        if (dist < 40 && !station.measured) {
            station.measured = true;
            player.water = Math.min(player.water + station.waterLevel, CONFIG.MAX_WATER);
            updateQuestProgress('measure_stations');
            
            showNotification(`Water station measured! +${station.waterLevel}💧`);
            
            // Measurement particles
            for (let i = 0; i < 15; i++) {
                particles.push({
                    x: station.x,
                    y: station.y,
                    vx: Math.random() * 3 - 1.5,
                    vy: -Math.random() * 3 - 1,
                    life: 40,
                    size: 5,
                    color: '#3498db'
                });
            }
            
            // Reset station after delay for reuse
            setTimeout(() => {
                station.measured = false;
                station.waterLevel = Math.floor(Math.random() * 50) + 20;
            }, 30000);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function showNotification(text) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: absolute;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 15, 10, 0.9);
        border: 2px solid #c9a66b;
        padding: 10px 20px;
        color: #e8d5b7;
        font-size: 14px;
        border-radius: 5px;
        animation: fadeInOut 2s forwards;
    `;
    notification.textContent = text;
    document.getElementById('ui').appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

function updateHUD() {
    document.getElementById('waterCount').textContent = Math.floor(player.water);
    document.getElementById('waterFill').style.width = `${(player.water / CONFIG.MAX_WATER) * 100}%`;
    document.getElementById('credits').textContent = player.credits;
    
    // Update location based on position
    const tileX = Math.floor(player.x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(player.y / CONFIG.TILE_SIZE);
    const tileType = worldMap[tileY]?.[tileX] || 'DESERT';
    document.getElementById('location').textContent = TILE_TYPES[tileType].name;
    
    // Update inventory display
    for (let i = 0; i < 5; i++) {
        const slot = document.getElementById(`slot${i}`);
        slot.textContent = player.inventory[i] || '';
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#2d1f14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw world
    renderWorld();
    
    // Draw water stations
    renderWaterStations();
    
    // Draw NPCs
    renderNPCs();
    
    // Draw enemies
    renderEnemies();
    
    // Draw player
    renderPlayer();
    
    // Draw particles
    renderParticles();
    
    ctx.restore();
    
    // Draw minimap
    renderMinimap();
    
    // Draw pause screen
    if (currentState === GameState.PAUSED) {
        ctx.fillStyle = 'rgba(26, 15, 10, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#c9a66b';
        ctx.font = '48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Courier New';
        ctx.fillText('Press ESC to continue', canvas.width / 2, canvas.height / 2 + 50);
    }
}

function renderWorld() {
    const startTileX = Math.floor(camera.x / CONFIG.TILE_SIZE);
    const startTileY = Math.floor(camera.y / CONFIG.TILE_SIZE);
    const endTileX = Math.ceil((camera.x + CONFIG.CANVAS_WIDTH) / CONFIG.TILE_SIZE);
    const endTileY = Math.ceil((camera.y + CONFIG.CANVAS_HEIGHT) / CONFIG.TILE_SIZE);
    
    for (let y = startTileY; y <= endTileY && y < worldMap.length; y++) {
        for (let x = startTileX; x <= endTileX && x < worldMap[0].length; x++) {
            if (y < 0 || x < 0) continue;
            
            const tileType = worldMap[y][x];
            const tile = TILE_TYPES[tileType];
            
            ctx.fillStyle = tile.color;
            ctx.fillRect(
                x * CONFIG.TILE_SIZE,
                y * CONFIG.TILE_SIZE,
                CONFIG.TILE_SIZE,
                CONFIG.TILE_SIZE
            );
            
            // Add details
            if (tileType === 'PALM') {
                drawPalmTree(x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2, y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2);
            } else if (tileType === 'PALACE') {
                drawPalace(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE);
            } else if (tileType === 'ROCK') {
                drawRock(x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2, y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2);
            }
        }
    }
}

function drawPalmTree(x, y) {
    // Trunk
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x - 3, y - 15, 6, 20);
    
    // Leaves
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.arc(x, y - 15, 12, 0, Math.PI * 2);
    ctx.fill();
}

function drawPalace(x, y) {
    // Palace building
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x + 5, y + 5, 30, 30);
    
    // Dome
    ctx.fillStyle = '#c9a66b';
    ctx.beginPath();
    ctx.arc(x + 20, y + 5, 15, Math.PI, 0);
    ctx.fill();
}

function drawRock(x, y) {
    ctx.fillStyle = '#6b5340';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
}

function renderWaterStations() {
    for (let station of waterStations) {
        if (!isOnScreen(station)) continue;
        
        // Station building
        ctx.fillStyle = station.measured ? '#27ae60' : station.color;
        ctx.fillRect(station.x - station.width / 2, station.y - station.height / 2, station.width, station.height);
        
        // Water level indicator
        ctx.fillStyle = '#3498db';
        const waterHeight = (station.waterLevel / 100) * station.height;
        ctx.fillRect(
            station.x - station.width / 2 + 5,
            station.y + station.height / 2 - waterHeight - 5,
            station.width - 10,
            waterHeight
        );
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('STATION', station.x, station.y - station.height / 2 - 5);
    }
}

function renderNPCs() {
    for (let npc of npcs) {
        if (!isOnScreen(npc)) continue;
        
        // NPC body
        ctx.fillStyle = npc.color;
        ctx.fillRect(npc.x - npc.width / 2, npc.y - npc.height / 2, npc.width, npc.height);
        
        // Quest indicator
        if (npc.quest && !activeQuests.find(q => q.id === npc.quest.id) && !completedQuests.find(q => q.id === npc.quest.id)) {
            ctx.fillStyle = '#f39c12';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('!', npc.x, npc.y - npc.height / 2 - 10);
        }
        
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, npc.x, npc.y + npc.height / 2 + 15);
    }
}

function renderEnemies() {
    for (let enemy of enemies) {
        if (!enemy.isAlive || !isOnScreen(enemy)) continue;
        
        // Enemy body
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
        
        // Health bar
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - 15, enemy.y - enemy.height / 2 - 10, 30, 5);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x - 15, enemy.y - enemy.height / 2 - 10, 30 * (enemy.health / enemy.maxHealth), 5);
    }
}

function renderPlayer() {
    const x = player.x;
    const y = player.y;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + player.height / 2 + 3, player.width / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    const bodyColors = {
        up: '#8b7355',
        down: '#a0826d',
        left: '#9b8b75',
        right: '#9b8b75'
    };
    
    ctx.fillStyle = bodyColors[player.direction];
    ctx.fillRect(x - player.width / 2, y - player.height / 2, player.width, player.height);
    
    // Head
    ctx.fillStyle = '#d4a76a';
    ctx.beginPath();
    ctx.arc(x, y - 8, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#3498db';
    const eyeOffset = player.direction === 'left' ? -3 : player.direction === 'right' ? 3 : 0;
    ctx.beginPath();
    ctx.arc(x + eyeOffset - 3, y - 9, 2, 0, Math.PI * 2);
    ctx.arc(x + eyeOffset + 3, y - 9, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Movement animation (legs)
    if (player.isMoving) {
        const legOffset = Math.sin(player.animFrame * Math.PI / 2) * 5;
        ctx.fillStyle = '#6b5340';
        ctx.fillRect(x - 8, y + player.height / 2, 6, 8 + legOffset);
        ctx.fillRect(x + 2, y + player.height / 2, 6, 8 - legOffset);
    }
}

function renderParticles() {
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 100;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function renderMinimap() {
    minimapCtx.fillStyle = '#2d1f14';
    minimapCtx.fillRect(0, 0, 150, 150);
    
    const scaleX = 150 / CONFIG.WORLD_WIDTH;
    const scaleY = 150 / CONFIG.WORLD_HEIGHT;
    
    // Draw tiles (simplified)
    for (let y = 0; y < worldMap.length; y += 5) {
        for (let x = 0; x < worldMap[0].length; x += 5) {
            const tileType = worldMap[y][x];
            minimapCtx.fillStyle = TILE_TYPES[tileType].color;
            minimapCtx.fillRect(x * CONFIG.TILE_SIZE * scaleX, y * CONFIG.TILE_SIZE * scaleY, 5, 5);
        }
    }
    
    // Draw NPCs
    for (let npc of npcs) {
        minimapCtx.fillStyle = npc.color;
        minimapCtx.fillRect(npc.x * scaleX - 2, npc.y * scaleY - 2, 4, 4);
    }
    
    // Draw player
    minimapCtx.fillStyle = '#fff';
    minimapCtx.beginPath();
    minimapCtx.arc(player.x * scaleX, player.y * scaleY, 4, 0, Math.PI * 2);
    minimapCtx.fill();
    
    // Camera view rectangle
    minimapCtx.strokeStyle = '#c9a66b';
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(
        camera.x * scaleX,
        camera.y * scaleY,
        CONFIG.CANVAS_WIDTH * scaleX,
        CONFIG.CANVAS_HEIGHT * scaleY
    );
}

function isOnScreen(obj) {
    return obj.x + obj.width > camera.x &&
           obj.x - obj.width < camera.x + CONFIG.CANVAS_WIDTH &&
           obj.y + obj.height > camera.y &&
           obj.y - obj.height < camera.y + CONFIG.CANVAS_HEIGHT;
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Add fade-in-out animation and other styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        20% { opacity: 1; transform: translateX(-50%) translateY(0); }
        80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
    
    @keyframes sandstorm {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    @keyframes waterWave {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
    
    .sandstorm-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(201, 166, 107, 0.1), transparent);
        animation: sandstorm 3s infinite;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Day/Night cycle
let dayTime = 0;
const DAY_CYCLE = 12000; // frames for full day cycle

function getDayNightAlpha() {
    const cycle = (dayTime % DAY_CYCLE) / DAY_CYCLE;
    // Simple sine wave for day/night
    return (Math.sin(cycle * Math.PI * 2 - Math.PI / 2) + 1) / 2;
}

// Enhanced render with day/night overlay
const originalRender = render;
render = function() {
    originalRender();
    
    // Day/night overlay
    const alpha = getDayNightAlpha() * 0.3;
    ctx.fillStyle = `rgba(0, 0, 50, ${alpha})`;
    ctx.fillRect(camera.x, camera.y, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Sandstorm effect (random)
    if (Math.random() < 0.001) {
        const storm = document.createElement('div');
        storm.className = 'sandstorm-overlay';
        document.getElementById('gameContainer').appendChild(storm);
        setTimeout(() => storm.remove(), 3000);
    }
}

// Add fog of war effect for immersion
const explored = new Set();

function updateExplored() {
    const tileX = Math.floor(player.x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(player.y / CONFIG.TILE_SIZE);
    
    // Mark nearby tiles as explored
    for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
            explored.add(`${tileX + dx},${tileY + dy}`);
        }
    }
}

// Enhanced update to include fog
const originalUpdate = update;
update = function() {
    originalUpdate();
    updateExplored();
}

// Add trading system with merchant
function openTradeWindow() {
    const tradeWindow = document.createElement('div');
    tradeWindow.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(26, 15, 10, 0.95);
        border: 2px solid #c9a66b;
        padding: 20px;
        color: #e8d5b7;
        border-radius: 10px;
        z-index: 100;
    `;
    
    tradeWindow.innerHTML = `
        <h2 style="color: #c9a66b; margin-bottom: 15px;">CHOAM Trade Window</h2>
        <div style="margin-bottom: 10px;">Water: ${Math.floor(player.water)} 💧</div>
        <div style="margin-bottom: 20px;">Credits: ${player.credits} ⚡</div>
        <button onclick="tradeWaterForCredits(10)" style="margin: 5px; padding: 10px; background: #3d2b1f; border: 2px solid #c9a66b; color: #c9a66b; cursor: pointer; border-radius: 5px;">Sell 10💧 for 15⚡</button>
        <button onclick="tradeCreditsForWater(15)" style="margin: 5px; padding: 10px; background: #3d2b1f; border: 2px solid #c9a66b; color: #c9a66b; cursor: pointer; border-radius: 5px;">Buy 15💧 for 20⚡</button>
        <br>
        <button onclick="this.parentElement.remove()" style="margin-top: 15px; padding: 10px 20px; background: #c9a66b; border: none; color: #1a0f0a; cursor: pointer; border-radius: 5px;">Close</button>
    `;
    
    document.getElementById('ui').appendChild(tradeWindow);
}

function tradeWaterForCredits(amount) {
    if (player.water >= amount) {
        player.water -= amount;
        player.credits += Math.floor(amount * 1.5);
        showNotification(`Traded ${amount}💧 for ${Math.floor(amount * 1.5)}⚡`);
        updateHUD();
    } else {
        showNotification('Not enough water!');
    }
}

function tradeCreditsForWater(amount) {
    const cost = Math.floor(amount / 15 * 20);
    if (player.credits >= cost) {
        player.credits -= cost;
        player.water = Math.min(player.water + amount, CONFIG.MAX_WATER);
        showNotification(`Bought ${amount}💧 for ${cost}⚡`);
        updateHUD();
    } else {
        showNotification('Not enough credits!');
    }
}

// Make trade functions globally accessible
window.tradeWaterForCredits = tradeWaterForCredits;
window.tradeCreditsForWater = tradeCreditsForWater;

// Enhanced NPC interaction to include trading
const originalStartDialogue = startDialogue;
startDialogue = function(npc) {
    originalStartDialogue(npc);
    
    // If merchant, add trade option
    if (npc.id === 'merchant') {
        setTimeout(() => {
            const tradeBtn = document.createElement('button');
            tradeBtn.textContent = '💰 Open Trade Window';
            tradeBtn.className = 'menu-btn';
            tradeBtn.style.cssText = 'margin-top: 10px;';
            tradeBtn.onclick = openTradeWindow;
            document.getElementById('dialogueBox').appendChild(tradeBtn);
        }, 200);
    }
}

// Add score system
let score = 0;

function addScore(points) {
    score += points;
    showNotification(`+${points} Score!`);
}

// Reward score for completions
const originalCompleteQuest = completeQuest;
completeQuest = function(questId) {
    originalCompleteQuest(questId);
    addScore(100);
}

const originalUpdateEnemies = updateEnemies;
updateEnemies = function() {
    const prevHealth = enemies.map(e => e.health);
    originalUpdateEnemies();
    
    // Check for enemy defeats
    enemies.forEach((e, i) => {
        if (prevHealth[i] > 0 && e.health <= 0) {
            addScore(25);
        }
    });
}

// Display score in HUD
const originalUpdateHUD = updateHUD;
updateHUD = function() {
    originalUpdateHUD();
    
    // Add score display if not exists
    let scoreEl = document.getElementById('scoreDisplay');
    if (!scoreEl) {
        const hud = document.getElementById('hud');
        scoreEl = document.createElement('div');
        scoreEl.id = 'scoreDisplay';
        scoreEl.className = 'hud-panel';
        hud.appendChild(scoreEl);
    }
    scoreEl.innerHTML = `<div>🏆 Score: ${score}</div>`;
}

// Add weather system
const weather = {
    type: 'clear',
    timer: 0,
    
    update() {
        this.timer--;
        if (this.timer <= 0) {
            const rand = Math.random();
            if (rand < 0.7) {
                this.type = 'clear';
            } else if (rand < 0.9) {
                this.type = 'windy';
            } else {
                this.type = 'sandstorm';
            }
            this.timer = Math.random() * 500 + 300;
        }
    },
    
    applyEffects() {
        if (this.type === 'sandstorm') {
            player.speed = CONFIG.PLAYER_SPEED * 0.7;
        } else {
            player.speed = CONFIG.PLAYER_SPEED;
        }
    }
};

// Integrate weather into game loop
const originalGameLoop = gameLoop;
gameLoop = function() {
    weather.update();
    weather.applyEffects();
    update();
    render();
    requestAnimationFrame(gameLoop);
}

console.log('Casa Portil game engine loaded with enhanced features!');
