# API Contracts - Dune Game

**Endpoint: GET /api/game/config**
Returns: GameConfig

**Endpoint: GET /api/game/state**
Returns: GameState (initial state)

**Endpoint: GET /api/game/npcs**
Returns: List<NPC>

**Endpoint: GET /api/game/stations**
Returns: List<WaterStation>

**Endpoint: POST /api/docx/extract**
- Body: `{ "filePath": string }`
- Returns: DocumentContent