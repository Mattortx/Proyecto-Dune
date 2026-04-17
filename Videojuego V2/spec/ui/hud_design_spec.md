# Casa Portil - HUD Design Spec

## 1. Principles
- 3 persistent bands: Top (sovereignty), Center (identity+time), Bottom (legitimacy+orders)
- Reference: Frostpunk 1 (composition, not copy)
- Tone: Hydraulic-notarial (wet slate, old silver, smoky glass, gates, cartography)
- NOT: coal/iron industrial, fantasy, generic sci-fi

## 2. Screen Structure (1920x1080)
### Primary: 16:9
### Secondary: 21:9, 16:10

**Layout:**
- Top-left: Menu button
- Top band: Strategic resources
- Center: Large medallion with House Portil crest (where Frostpunk has temperature)
- Below medallion: Time control + calendar
- Bottom band: Stability, approval, 4 government buttons
- Secondary layer: Alerts, tooltips, modals

## 3. Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Verde Estuario | #2B443B | Healthy states, active selection, soft highlights |
| Negro Pizarra | #1A1D20 | Backgrounds, panels, bars |
| Plata Fluvial | #B0B3B4 | Frames, linear iconography, main numerals |
| Plata clara | #C4C5C4 | Priority text, active contours |
| Sombra panel | #111317 | Deep panel shadow |

Exception: Amber or dull red for critical alerts (sparingly)

## 4. Top Header

### 4.1 Menu Button
- Position: Top-left, 24-32px margin from edge
- Shape: Circular medallion or shield with gear/gate icon
- Function: Pause modal (Continue, Save, Load, Settings, Codex, Exit)
- States:
  - Normal: Aged silver on slate
  - Hover: Green estuario halo
  - Active: Light silver border
  - Alert: Small luminous dot if unsaved changes

### 4.2 Top Resource Bar
- Crosses entire top, interrupted by center medallion
- Left of crest: Money, Prestige
- Right of crest: Faith, Armed Forces
- Each resource: Icon + main value + tick/day variation + tooltip

**Card Design:**
- Base: Textured slate
- Silver fluid frame
- Icon in silver
- Value in light silver
- Positive variation: Green estuario
- Negative variation: Amber/dull red

## 5. Center: House Portil Crest
- Position: Axial center
- Function: Identity, replaces Frostpunk's thermometer
- Size: 180-220px diameter at 1080p
- Design:
  - Double ring silver fluid border
  - Very dark green estuario background
  - Dark falcon shield on tripartite silver delta
  - Subtle highlights, not garish
  - NOT: smoke, ice - instead: cold condensation, light mist, wet reflection
- Behavior:
  - Normal: Static with near-imperceptible micro-animation
  - Hover: Slight luminance increase
  - Click: Opens "House Portil Panel"
- NO permanent numbers - purely identitary

## 6. Time Control (below medallion)
### Composition:
- Four buttons: Pause, Play, Fast, Very Fast
- Right/below: Internal date block
- Format: Calendar/Day/Month-Year/Hour
```
|| pausa > play >> rápido >>> muy rápido
```
- Design:
  - Narrow slate bar
  - Circular buttons
  - Silver iconography
  - Active highlighted in green estuario

## 7. Bottom Band

### 7.1 Status Indicators (bottom-left)
- Two stacked horizontal bars
- Labels left, values right

**Stability:** Internal order solidity, crisis absorption, administrative cohesion
**Approval:** Government acceptance by subjects, local elites, relevant bodies

- Color: Green estuario fill → dirty silver → amber if risk zone
- Always: Numeric value, state text, icon, trend marker

### 7.2 Command Block (center)
- Four large ceremonial medallons
- Order: Construction | Politics | Research | Diplomacy
- States: Normal, hover, selected, blocked, available+new, critical+pending

**Recommended 5th button:** Alerts/Log (smaller) for critical priority access

## 8. Dropdown Menus
NOT fullscreen except major cases. Use side panels or partial modals.

- **Construction:** Left panel, categorized, costs/effects
- **Politics:** Wide semi-modal, divided (Government, Internal Order, Faith, Admin, Army)
- **Research:** Center panel/table, node tree, visible/blocked branches
- **Diplomacy:** Right panel, faction portraits, relationship states

**Shared grammar:**
- Silver fluid header
- Semi-textured slate background
- Green estuario details
- Short, precise, hierarchical text

## 9. Material Style
- NOT chrome - polished metal
- NOT literal mud - dark stone + smoked glass
- Old silver filigrees
- Suggested humidity (not literal mud)
- Contained ornamentation
- Heraldry + hydraulic geometry
- Ceremonial typography for titles, functional for data

## 10. Technical Contract (Component Tree)
```
HUDRoot
├── TopLeftMenuButton
├── TopResourceBar
│   ├── LeftResources: MoneyCard, PrestigeCard
│   ├── CenterCrestMedallion
│   └── RightResources: FaithCard, ArmedForcesCard
├── TimeControlBar
│   ├── PauseButton, PlayButton, FastButton, VeryFastButton
│   └── CalendarDisplay, DayDisplay, HourDisplay
├── BottomStatusBar
│   ├── StabilityMeter
│   └── ApprovalMeter
├── BottomCommandBar
│   ├── ConstructionButton
│   ├── PoliticsButton
│   ├── ResearchButton
│   ├── DiplomacyButton
│   └── AlertsButton
└── OverlayLayer
    ├── TooltipSystem
    ├── NotificationToasts
    ├── ModalMenu
    ├── ConstructionPanel
    ├── PoliticsPanel
    ├── ResearchPanel
    ├── DiplomacyPanel
    └── SaveLoadPanel
```

## 11. UX Rules (Mandatory)
- Every critical number: icon + number + tooltip
- Every variation: trend indicator
- Every alert: clickable + links to origin
- No essential data more than 2 clicks away
- Persistent government info visible when submenus open

## 12. Conclusion
Essential HUD: Frostpunk composition rewritten in Portil key
- Top band: Sovereignty + resources
- Center: House crest dominates
- Core under crest: Time
- Bottom: Legitimacy + government

Must feel LESS like industrial survival and MORE like ritualized administration of power, archive, and flow.