# Firebase Firestore Schema - Dune: The Measure

## Colecciones

### 1. `games`
Partidas guardadas de los jugadores.

```javascript
{
  id: string,           // ID único del documento
  playerId: string,     // ID del jugador (auth)
  name: string,        // Nombre de la partida
  createdAt: timestamp, // Fecha de creación
  updatedAt: timestamp, // Última actualización
  state: {
    // Recursos principales
    resources: {
      funds: number,        // Fondos (inicio: 5000)
      water: number,       // Agua (inicio: 1000)
      food: number,       // Comida (inicio: 1000)
      prestige: number,  // Prestigio (inicio: 100)
      staff: number,      // personal (inicio: 50)
    },
    
    // Población
    population: {
      total: number,        // Total (inicio: 100)
      workers: number,      // Trabajadores (inicio: 50)
      scientists: number, // Científicos (inicio: 20)
      guards: number,      // Guardias (inicio: 10)
      nobles: number,     // Nobles (inicio: 20)
      stress: number,     // Estrés (inicio: 20)
    },
    
    // Familia real
    family: {
      dynastyName: string,         // "Casa Portil"
      ruler: {
        name: string,           // "Archivist Vanya"
        role: string           // "Regente"
      },
      legitimacy: number,        // Legitimidad (inicio: 80)
      influence: number         // Influencia (inicio: 50)
    },
    
    // Gobierno
    government: {
      stability: number,   // Estabilidad (inicio: 70)
      approval: number    // Aprobación (inicio: 60)
    },
    
    // Ejército
    army: {
      defense: number,    // Defensa (inicio: 50)
      guards: number,     // Guardias (inicio: 20)
      security: number,  // Seguridad (inicio: 50)
      power: number,    // Poder (inicio: 50)
      morale: number,   // Moral (inicio: 50)
      discipline: number // Disciplina (inicio: 50)
    },
    
    // Diplomacia
    diplomacy: {
      reputation: number // Reputación (inicio: 50)
    },
    
    // Timeline
    events: {
      timeline: number,    // Timeline (inicio: 0)
      day: number,        // Día (inicio: 1)
      month: string,      // Mes (inicio: "Cicloceno")
      year: number,      // Año (inicio: 1020)
      hour: number       // Hora (inicio: 8)
    },
    
    // Edificios
    buildings: [
      {
        id: string,
        name: string,
        category: string,  // "Aclima", "Exhibition", "Science", "Logistics", "Security", "Archive"
        isBuilt: boolean,
        cost: {
          funds?: number,
          water?: number,
          food?: number
        },
        effects: {
          waterGeneration?: number,
          foodGeneration?: number,
          fundsGeneration?: number,
          prestigeGeneration?: number,
          securityBonus?: number
        }
      }
    ],
    
    // Distritos
    districts: [string],
    
    // Riesgos y producción
    riskLevel: number,      // Nivel de riesgo (inicio: 70)
    production: {
      water: number,   // Producción agua (inicio: 2)
      food: number,   // Producción comida (inicio: 2)
      funds: number  // Producción fondos (inicio: 1)
    },
    
    // Recursos especiales
    faith: number,      // Fe (inicio: 80)
    military: number,   // Militar (inicio: 50)
    
    // Estado del juego
    timeSpeed: number,        // Velocidad (inicio: 1)
    isPaused: boolean,     // Pausado (inicio: false)
    hasUnsavedChanges: boolean,
    tickCount: number     // Contador de ciclos
  }
}
```

### 2. `buildings`
Catálogo de edificios disponibles.

```javascript
{
  id: string,          // ID único
  name: string,       // Nombre
  category: string,   // Categoría
  description: string, // Descripción
  cost: {
    funds: number,
    water?: number,
    food?: number
  },
  effects: {
    waterGeneration?: number,
    foodGeneration?: number,
    fundsGeneration?: number,
    prestigeGeneration?: number,
    securityBonus?: number
  },
  unlockRequirement?: string // Requisito para desbloquear
}
```

### 3. `policies`
Catálogo de políticas disponibles.

```javascript
{
  id: string,          // ID único
  name: string,       // Nombre
  effect: string,     // Efecto descrito
  cost: {
    funds?: number,
    prestige?: number
  },
  target: string    // "all"
}
```

### 4. `players`
Perfiles de jugadores.

```javascript
{
  id: string,           // ID de Firebase Auth
  displayName: string,  // Nombre mostrado
  createdAt: timestamp,
  lastLogin: timestamp,
  stats: {
    gamesPlayed: number,
    totalPlaytime: number,
    highestDay: number
  }
}
```

### 5. `game_sessions`
Historial de sesiones de juego.

```javascript
{
  gameId: string,       // Referencia a game
  playerId: string,     // Referencia a player
  startTime: timestamp,
  endTime: timestamp,
  dayStarted: number,
  dayEnded: number
}
```

---

## Reglas de Seguridad (Firestore Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Jugadores pueden leer/escribir sus propios datos
    match /players/{playerId} {
      allow read, write: if request.auth != null && request.auth.uid == playerId;
    }
    
    // Partidas: jugadores pueden crear y leer sus propias
    match /games/{gameId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && resource.data.playerId == request.auth.uid;
    }
    
    // Catálogos públicos (solo lectura)
    match /buildings/{buildingId} {
      allow read: if true;
    }
    
    match /policies/{policyId} {
      allow read: if true;
    }
  }
}
```

---

## Índices Recomendados

- `games`: index por `playerId` + `updatedAt` (desc)
- `game_sessions`: index por `gameId` + `startTime`