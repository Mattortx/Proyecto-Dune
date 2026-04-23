# Casa Portil - Gestión Hidráulica Dinástica

## Ejecutar en modo desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar con Electron
npm run dev
```

## Construir .exe para Windows

```bash
npm run build:win
```

El archivo .exe se generará en la carpeta `dist/`

---

## Estructura del proyecto

```
DuneGame.Backend/
├── electron/
│   └── main.js          # Punto de entrada de Electron
├── wwwroot/
│   ├── index.html       # Página principal del juego
│   ├── game.js          # Lógica del juego
│   └── firebase.js      # Servicio de Firebase
├── package.json         # Configuración de npm/Electron
└── dist/                # (generado) - aquí aparece el .exe
```

## Requisitos

- Node.js 18+ instalado
- npm o yarn

## Notas

- El juego funciona igual que en el navegador
- Firebase y localStorage funcionan correctamente en el .exe
- El juego se ejecuta en ventana de escritorio