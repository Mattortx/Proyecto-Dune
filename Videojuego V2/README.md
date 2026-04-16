# 🏜️ Dune: Casa Portil - Guardians of the Water

A complete 2D top-down adventure game set in the Dune universe, based on the "Casa Portil" lore document.

## 🎮 Game Overview

**Casa Portil** is a Minor House in the Dune universe specializing in hydrological measurement, archive-based sovereignty, and water custody. In this harsh desert world, water is life, and those who control water hold great power.

### Game Features
- **Open World Exploration**: Explore a vast desert world with cities, sietches, and water measurement stations
- **Resource Management**: Manage water and credits wisely to survive
- **Quest System**: Complete missions from the Living Archive and key NPCs
- **Diplomatic Missions**: Navigate feudal politics and alliances
- **Trading System**: Trade water and credits with CHOAM merchants
- **Dynamic Weather**: Experience sandstorms that affect movement
- **Day/Night Cycle**: Beautiful atmospheric lighting changes
- **Combat System**: Defend water convoys from rival houses
- **NPC Interactions**: Rich dialogue system with lore-accurate characters

## 🎯 How to Play

### Starting the Game
1. Open `index.html` in any modern web browser
2. Click "Start Game" from the main menu
3. Use the controls below to play

### Controls
| Key | Action |
|-----|--------|
| **WASD** or **Arrow Keys** | Move your character |
| **SPACE** | Interact with NPCs / Continue dialogue |
| **Q** | Toggle quest log |
| **ESC** | Pause/Resume game |

### Objectives
- **Complete quests** for Casa Portil from various NPCs
- **Measure water stations** scattered across the desert
- **Protect water convoys** from rival house agents
- **Participate in the Rito del Rio** ceremony preparations
- **Trade resources** with CHOAM merchants
- **Explore** the vast desert world and discover locations

## 🎨 Game Elements

### HUD (Heads-Up Display)
- **💧 Water Bar**: Your water supply (depletes over time and combat)
- **📍 Location**: Current area you're in
- **⚡ Credits**: CHOAM currency for trading
- **🏆 Score**: Your achievement points

### NPCs
- **Archivist Vanya** (Purple): Provides measurement quests from the Living Archive
- **Captain Cael** (Red): Offers convoy protection missions
- **Merchant Seris** (Green): Trading post for water and credits
- **Priestess Ilyna** (Gold): Sacred Rito del Rio ceremony quests

### Locations
- **Casa Portil Palace**: Central hub and starting point
- **Water Measurement Stations**: Blue buildings to measure and record
- **Sietches**: Desert settlements scattered across the map
- **Palm Groves**: Rare oases in the desert

### Enemies
- **Rival House Agents**: Red enemies that attack water convoys
- Defeating them earns credits and score points

## 🎮 Gameplay Mechanics

### Water Management
- Water is your most precious resource
- Collect water from measurement stations
- Spend water in combat and trading
- Keep your water supply above zero!

### Quest System
- NPCs offer quests with yellow "!" indicators
- Track progress in the quest log (press Q)
- Complete quests for water, credits, and score rewards

### Trading
- Visit Merchant Seris to open the trade window
- Sell water for credits (10💧 → 15⚡)
- Buy water with credits (15💧 ← 20⚡)

### Weather System
- **Clear**: Normal gameplay
- **Windy**: Visual effects only
- **Sandstorm**: Reduced movement speed (70%)

### Combat
- Enemies deal damage and reduce your water
- Defeat enemies to protect convoys
- Enemies respawn after 10 seconds

### Score System
- Complete quests: +100 points
- Defeat enemies: +25 points
- Track your progress on the HUD

## 📜 Lore Background

Casa Portil is a Minor House specializing in:
- **Hydrological Measurement**: Tracking and recording water levels
- **Archive-Based Sovereignty**: Power through knowledge and records
- **Water Custody**: Protecting and managing water resources
- **The Rito del Rio**: Sacred water-worshipping ritual tradition

The Living Archive holds records older than the Corrino dynasty, making water measurement both a science and sacred duty.

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas**: For 2D rendering
- **JavaScript**: Game engine and logic
- **CSS3**: UI styling and animations

### Game Architecture
- Game loop with 60 FPS rendering
- Camera system following the player
- Tile-based world generation
- Particle effects system
- NPC dialogue system
- Quest tracking system
- Dynamic weather system
- Day/night cycle

### Performance
- Efficient tile rendering (only visible tiles)
- Object pooling for particles
- Optimized collision detection

## 🚀 Running the Game

### Requirements
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No additional software needed

### Steps
1. Navigate to the game folder
2. Double-click `index.html`
3. The game will open in your default browser
4. Click "Start Game" and enjoy!

### Alternative: Local Server
For best performance, you can serve the files locally:
```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx http-server

# Then open: http://localhost:8000
```

## 🎯 Tips & Strategies

1. **Explore first**: Find nearby water stations to build your supply
2. **Talk to all NPCs**: Each offers unique quests and rewards
3. **Avoid early combat**: Enemies reduce your water quickly
4. **Trade wisely**: The merchant offers fair trades
5. **Check quest log**: Press Q to track your objectives
6. **Watch for weather**: Sandstorms slow you down
7. **Map the area**: Use the minimap to navigate

## 🌟 Future Enhancements (Ideas)

- Additional quest lines and NPCs
- Boss battles with rival house leaders
- Base building and upgrades
- Multiple planets/locations
- Deeper political simulation
- Sound effects and music
- Save/load game functionality
- Multiplayer cooperative mode

## 📝 Credits

**Game Design**: Based on the "Proyecto Dune - Lore" document for Casa Portil
**Development**: Complete HTML5/JavaScript 2D game
**Inspiration**: Frank Herbert's Dune universe

## 📄 License

This is a fan project based on the Dune universe, created for educational and entertainment purposes.

---

**Enjoy your journey as a Guardian of the Water for Casa Portil!** 🏜️💧

*"Water is life. Our measurements keep Casa Portil strong."*
