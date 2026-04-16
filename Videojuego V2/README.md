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

### Running the Backend (Optional)
```bash
cd src/DuneGame.Backend/DuneGame.Backend
dotnet run
```
Then open http://localhost:5000

### Running Offline (No Backend Required)
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

## 🏗️ Architecture (SDD - Specification-Driven Development)

```
src/DuneGame.Backend/
├── Domain/
│   ├── Entities/      # Game entities (Player, NPC, Quest, etc.)
│   └── Models/        # Data models (GameConfig, DocumentContent)
├── Application/
│   ├── Interfaces/    # Service contracts
│   └── Services/      # Business logic
├── Infrastructure/
│   └── Services/      # Implementations (DocxReader, GameData)
├── Controllers/       # API endpoints
└── wwwroot/           # Frontend (index.html, game.js)

spec/
├── use_cases/         # Feature use cases
├── domain_rules/      # Business rules
├── contracts/         # API contracts
└── data_models/       # Data models specification
```

### Backend API Endpoints
- `GET /api/game/config` - Game configuration
- `GET /api/game/state` - Initial game state
- `GET /api/game/npcs` - NPC data
- `GET /api/game/stations` - Water stations
- `GET /api/game/map` - World map
- `POST /api/docx/extract` - Extract text from .docx files

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

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas**: For 2D rendering
- **JavaScript**: Game engine and logic (frontend)
- **C# .NET 10**: Backend API (optional)
- **DocumentFormat.OpenXml**: .docx parsing

### Performance
- Efficient tile rendering (only visible tiles)
- Object pooling for particles
- Optimized collision detection

## 📝 Credits

**Game Design**: Based on the "Proyecto Dune - Lore" document for Casa Portil
**Development**: Complete HTML5/JavaScript 2D game with optional .NET backend
**Inspiration**: Frank Herbert's Dune universe

---

**Enjoy your journey as a Guardian of the Water for Casa Portil!** 🏜️💧

*"Water is life. Our measurements keep Casa Portil strong."*