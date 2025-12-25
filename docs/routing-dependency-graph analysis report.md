# WebMidiBay Routing Module Dependency Graph

Aktualisiert: 21. Dezember 2025

Ebene 1 (Foundation - Minimale Dependencies):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────┐ ┌─────────────────────┐
│routingLinesSvg.js│ │routingToggleRouting │
│ │ │ .js │
│ - SVG Creation │ │ - Toggle Logic │
│ - Y-Position │ │ - Set Management │
└──────────────────┘ └─────────────────────┘
│ │
│ ⚠️ Circular! │
▼ ▼
┌──────────────────┐ ┌─────────────────────┐
│ routingLines.js │ │ routingCssClasses │
│ │◄────────┤ .js │
│ - Line Map │ │ │
│ - Smart Redraw │ │ - CSS Updates │
└──────────────────┘ │ - Highlighting │
▲ └─────────────────────┘
│ ▲
│ │
━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━
│ │
└────────────┬───────────────┘
│
▼
Ebene 2 (Utilities):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────────────────────────────┐
│ routingDragUtils.js │
│ │
│ - Drag Line Creation │
│ - Position Calculation │
│ - Selection Prevention │
│ │
│ imports: routingLinesSvg │
└──────────────────────────────────────────┘
│
│
━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━
│
▼
Ebene 3 (Event Layer):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│ routingDragAndDrop.js │
│ │
│ imports: │
│ - routingLines (visibility check) │
│ - routingToggleRouting (toggle action) │
│ - routingPorts (storage callback) ⚠️ │
│ - routingDragUtils (utilities) │
│ │
│ Event Pipeline: │
│ - pointerdown → pointermove → pointerup │
└────────────────────────────────────────────┘
│
│
━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━━━━━━━━━━━━━━━━━
│
▼
Ebene 4 (Orchestrator - Entry Point):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│ routingPorts.js │
│ │
│ imports: │
│ - routingLines (init) │
│ - routingDragAndDrop (init) │
│ - routingCssClasses (CSS updates) │
│ - routingToggleRouting (toggle) │
│ │
│ Orchestrator Functions: │
│ - initRouting() │
│ - storeRoutingOutPortName() │
│ - restoreRoutingOutPortName() │
│ - resetOutPortSet() / resetInPortSet() │
│ │
│ ⚡ Entry Point für main.js │
│ ⚡ State & Persistenz Manager │
└────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verwendung von außerhalb (external imports):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
main.js → routingPorts (initRouting)
htmlUpdater.js → routingLines (redrawRoutingLines)
htmlEventHandlers.js → routingPorts (resetAllRouting)
portInteraction.js → routingToggleRouting (togglePortRouting)
portSelection.js → routingCssClasses (setOutportRoutingClass)

Circular Dependencies (2):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ routingLines.js ↔ routingLinesSvg.js
└─ routingLinesUnvisible() import
└─ Status: Akzeptabel (nur Helper-Function)

⚠️ routingPorts.js ⇄ routingDragAndDrop.js
└─ Init ↔ Storage-Callback
└─ Status: Akzeptabel (keine zyklische Initialisierung)

Design Pattern:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Layered Architecture (4 Ebenen)
✓ Orchestrator Pattern (routingPorts als Entry Point)
✓ Smart-Redraw mit Change-Detection
✓ Port-Namen statt Refs für Persistenz
✓ Symmetrische Sets (inPort.outPortSet ↔ outPort.inPortSet)

### routingPorts.js (Entry Point)

**Rolle:** Routing-Initialisierung und State-Management

```javascript
// Imports (13 total)
import { midiBay } from '../main.js';
import { getPortProperties, forEachPortWithPortProperties } from '../utils/helpers.js';
import { getStorage, setStorage } from '../storage/storage.js';
import { logger } from '../utils/logger.js';
import { clearInnerHTML } from '../html/domContent.js';
import { preventAndStop } from '../html/domUtils.js';
import { initRoutingLines } from './routingLines.js';
import { initDragAndDrop } from './routingDragAndDrop.js';
import { restoreSelectedPort } from '../ports/portSelection.js';
import { setInportRoutingClass, setOutportRoutingClass } from './routingCssClasses.js';
import { toggleRouting } from './routingToggleRouting.js';
```

#### Abhängigkeitsbaum

```
routingPorts.js (Koordinator)
├── routingLines.js (SVG-Init)
│     └─> routingLinesSvg.js
├── routingDragAndDrop.js (Event-Setup)
│     ├─> routingToggleRouting.js
│     ├─> routingLines.js
│     ├─> routingPorts.js (storeRoutingOutPortName) ⚠️ Circular!
│     └─> routingDragUtils.js
├── routingCssClasses.js (CSS-Updates)
├── routingToggleRouting.js (Toggle-Logic)
│     ├─> routingLines.js
│     └─> routingCssClasses.js
├── ports/portSelection.js (Port-Selection-Restore)
├── storage/storage.js (sessionStorage)
├── html/domContent.js (clearInnerHTML)
├── html/domUtils.js (preventAndStop)
└── utils/helpers.js (getPortProperties, forEachPortWithPortProperties)
```

#### Exports

```javascript
export { initRouting, resetAllRouting, storeRoutingOutPortName };
```

**Verwendung:**

- `main.js` ruft `initRouting()` beim App-Start
- `routingDragAndDrop.js` + `portInteraction.js` rufen `storeRoutingOutPortName()` nach Toggle
- `htmlEventHandlers.js` ruft `resetAllRouting()` bei Settings-Reset

#### Zirkuläre Abhängigkeit

```
routingPorts.js ⇄ routingDragAndDrop.js
├── routingPorts initialisiert routingDragAndDrop via initDragAndDrop()
└── routingDragAndDrop importiert storeRoutingOutPortName aus routingPorts

Resolution: Akzeptabel, da nur Function-Reference-Import (keine zyklische Initialisierung)
```

---

### routingToggleRouting.js (Toggle-Logic) **[NEU]**

**Rolle:** Toggle-Logik für Routing-Verbindungen

```javascript
// Imports (7 total)
import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { drawAllRoutingLines } from './routingLines.js';
import { setInportRoutingClass, setOutportRoutingClass } from './routingCssClasses.js';
```

#### Abhängigkeitsbaum

```
routingToggleRouting.js
├── routingLines.js (drawAllRoutingLines)
│     └─> routingLinesSvg.js (drawRoutingLine, resetGraphTagPosition)
├── routingCssClasses.js (CSS-Updates)
│     └─> (keine routing/-Imports)
├── utils/helpers.js (getPortProperties)
├── utils/logger.js
└── main.js (midiBay)
```

#### Exports

```javascript
export { togglePortRouting, toggleRouting };
```

**Verwendung:**

- `routingPorts.js` weist `toggleRouting` zu `midiBay.toggleRouting` zu
- `routingDragAndDrop.js` ruft `togglePortRouting()` bei erfolgreichem Drop
- `portInteraction.js` ruft `togglePortRouting()` bei Click-basiertem Routing

#### Funktions-Hierarchie

```
togglePortRouting(inPort, outPort, storeCallback)
  ├─> midiBay.toggleRouting(inPort, outPort)
  │     └─> toggleRouting(inPort, outPort)          [implementiert hier]
  │           ├─> portProperties.outPortSet.add/delete
  │           ├─> portProperties.outPortNameSet.add/delete
  │           ├─> portProperties.inPortSet.add/delete
  │           ├─> activeClockSourceSet.delete
  │           └─> drawAllRoutingLines()
  ├─> storeCallback()                                [from caller]
  ├─> setInportRoutingClass()
  └─> setOutportRoutingClass()
```

**Refactoring-Historie:** Extrahiert aus routingPorts.js (21.12.2025)

---

### routingLines.js (Line-Management)

**Rolle:** SVG-Linien-Management und Smart-Redraw

```javascript
// Imports (6 total)
import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { getComputedStyleValue } from '../html/domUtils.js';
import { drawRoutingLine, resetGraphTagPosition } from './routingLinesSvg.js';
import { getPortProperties } from '../utils/helpers.js';
import { clearInnerHTML } from '../html/domContent.js';
```

#### Abhängigkeitsbaum

```
routingLines.js
├── routingLinesSvg.js (SVG-Erstellung)
│     └─> routingLines.js (routingLinesUnvisible) ⚠️ Circular!
├── html/domUtils.js (getComputedStyleValue)
├── html/domContent.js (clearInnerHTML)
├── utils/helpers.js (getPortProperties)
├── utils/logger.js
└── main.js (midiBay)
```

#### Exports

```javascript
export {
  initRoutingLines,
  routingLinesUnvisible,
  drawAllRoutingLines,
  redrawRoutingLines,
  getBoundingClientRectArray,
  getRectArrayDiffResult,
};
```

**Verwendung:**

- `routingPorts.js` ruft `initRoutingLines()` bei Initialisierung
- `routingToggleRouting.js` ruft `drawAllRoutingLines()` nach Toggle
- `htmlUpdater.js` ruft `redrawRoutingLines()` bei Window-Resize
- `routingLinesSvg.js` + `routingDragAndDrop.js` rufen `routingLinesUnvisible()` für Visibility-Checks

#### Zirkuläre Abhängigkeit

```
routingLines.js ↔ routingLinesSvg.js
├── routingLines importiert drawRoutingLine, resetGraphTagPosition
└── routingLinesSvg importiert routingLinesUnvisible

Resolution: Akzeptabel, nur Helper-Funktion importiert (keine zyklische Initialisierung)
```

#### Smart-Redraw-Logic

```javascript
redrawRoutingLines(forceUpdate = false)
  ├─> getBoundingClientRectArray(svgContainer)
  ├─> getRectArrayDiffResult(current, former)
  └─> if (diff !== 0 || forceUpdate): drawAllRoutingLines()
```

**Performance:** Vermeidet unnötige Redraws durch Rect-Caching

---

### routingLinesSvg.js (SVG-Rendering)

**Rolle:** Low-Level SVG-Element-Erstellung

```javascript
// Imports (4 total)
import { midiBay } from '../main.js';
import { setStyles, addClass } from '../html/domUtils.js';
import { routingLinesUnvisible } from './routingLines.js';
```

#### Abhängigkeitsbaum

```
routingLinesSvg.js
├── routingLines.js (routingLinesUnvisible) ⚠️ Circular!
├── html/domUtils.js (setStyles, addClass)
└── main.js (midiBay)
```

#### Exports

```javascript
export { drawRoutingLine, get_Y_CenterPosition, resetGraphTagPosition };
```

**Verwendung:**

- `routingLines.js` ruft `drawRoutingLine()` + `resetGraphTagPosition()`
- `routingDragUtils.js` ruft `drawRoutingLine()` + `get_Y_CenterPosition()` für Drag-Line

#### SVG-Rendering-Pipeline

```
drawRoutingLine(inPortTagId, outPortTagId)
  ├─> get_Y_CenterPosition(inPortTagId)
  │     ├─> getBoundingClientRect()
  │     └─> Berechne Y-Mittelpunkt relativ zu graphTagRect
  ├─> get_Y_CenterPosition(outPortTagId)
  ├─> createElementNS('line', svgNS)
  ├─> setAttribute(x1, y1, x2, y2, id)
  └─> addClass(line, 'line')
```

**SVG-Koordinaten:** Relativ zu `midiBay.graphTagRect` (SVG-Overlay-Container)

---

### routingCssClasses.js (CSS-Management)

**Rolle:** CSS-Klassen für Routing-Visualisierung

```javascript
// Imports (7 total)
import { midiBay } from '../main.js';
import {
  getPortProperties,
  forEachPortWithPortProperties,
  getSelectedPort,
  getPortByTagId,
} from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { toggleDisplayClass } from '../html/domUtils.js';
import { removeClassFromAll } from '../html/domClasses.js';
```

#### Abhängigkeitsbaum

```
routingCssClasses.js (keine routing/-Imports!)
├── html/domUtils.js (toggleDisplayClass)
├── html/domClasses.js (removeClassFromAll)
├── utils/helpers.js (getPortProperties, forEachPortWithPortProperties, getSelectedPort, getPortByTagId)
├── utils/logger.js
└── main.js (midiBay)
```

#### Exports

```javascript
export { setInportRoutingClass, setOutportRoutingClass };
```

**Verwendung:**

- `routingPorts.js` ruft beide bei Initialisierung
- `routingToggleRouting.js` ruft beide nach Toggle
- `portSelection.js` ruft `setOutportRoutingClass()` bei Selection-Änderung

#### CSS-Update-Pipeline

```
setOutportRoutingClass()
  ├─> setRoutedOutportRoutingClass()
  │     ├─> removeClassFromAll('.routed_to_input')
  │     └─> For each .routed_to_output:
  │           └─> markConnectedOutputPorts()
  │                 └─> addClass(outPort.tag, 'routed_to_input')
  │
  └─> setSelectRoutetOutportRoutingClass()
        ├─> clearRoutedToSelectedInputClass()
        ├─> highlightRoutedOutputs()                [wenn Input selected]
        └─> updateSelectedRoutingLines()
              ├─> removeClassFromAll('.line.selected')
              └─> For each line in lineMap:
                    if (lineInput/Output === selectedTagId):
                      addClass(line, 'selected')
```

**Besonderheit:** Keine routing/-Imports → Lose gekoppelt

---

### routingDragAndDrop.js (Event-Pipeline)

**Rolle:** Drag&Drop-Event-Handling

```javascript
// Imports (12 total)
import { midiBay } from '../main.js';
import { getPortByTagId, getSelectedPortProperties } from '../utils/helpers.js';
import { routingLinesUnvisible } from './routingLines.js';
import { togglePortRouting } from './routingToggleRouting.js';
import { storeRoutingOutPortName } from './routingPorts.js';
import { setSelectedPort } from '../ports/portInteraction.js';
import { removeClassFromAll } from '../html/domClasses.js';
import { setAttributes } from '../html/domContent.js';
import { removeClass, preventAndStop } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import {
  preventSelect,
  initializeDragLineIfNeeded,
  calculateDragLinePosition,
} from './routingDragUtils.js';
```

#### Abhängigkeitsbaum

```
routingDragAndDrop.js (Event-Hub)
├── routingLines.js (routingLinesUnvisible)
├── routingToggleRouting.js (togglePortRouting)
│     └─> routingLines.js, routingCssClasses.js
├── routingPorts.js (storeRoutingOutPortName) ⚠️ Circular!
├── routingDragUtils.js (Drag-Utilities)
│     └─> routingLinesSvg.js
├── ports/portInteraction.js (setSelectedPort)
├── html/domClasses.js (removeClassFromAll)
├── html/domContent.js (setAttributes)
├── html/domUtils.js (removeClass, preventAndStop)
├── utils/helpers.js (getPortByTagId, getSelectedPortProperties)
├── utils/logger.js
└── main.js (midiBay)
```

#### Exports

```javascript
export { initDragAndDrop };
```

**Verwendung:**

- `routingPorts.js` ruft `initDragAndDrop()` bei Initialisierung

#### Event-Pipeline

```
initDragAndDrop()
  └─> For each inPort:
        inPort.tag.addEventListener('pointerdown', routingEventStart)

routingEventStart(event)
  ├─> Set midiBay.clickedInPortTag
  ├─> addEventListener('pointermove', routingEventMove)
  ├─> addEventListener('pointerup', routingEventEnd)
  └─> preventSelect()

routingEventMove(event)
  ├─> initializeDragLineIfNeeded(event)              [routingDragUtils]
  ├─> calculateDragLinePosition(event_x, event_y)    [routingDragUtils]
  └─> setAttributes(dragLine, {x2, y2})

routingEventEnd(event)
  ├─> dragLine.remove()
  ├─> elementFromPoint(event_x, event_y)
  ├─> removeClass('routing_source', 'routing_target')
  ├─> if (endTarget.classList.contains('output')):
  │     togglePortRouting(inPort, outPort, storeRoutingOutPortName)
  ├─> removeEventListener('pointermove', 'pointerup')
  └─> midiBay.clickedInPortTag = null
```

**Guards:** Läuft nur wenn `midiBay.graphTag.classList.contains('routing')` aktiv

---

### routingDragUtils.js (Drag-Utilities) **[REFACTORED]**

**Rolle:** Drag-Line und Selection-Prevention

```javascript
// Imports (6 total)
import { midiBay } from '../main.js';
import { get_Y_CenterPosition, drawRoutingLine } from './routingLinesSvg.js';
import { removeClassFromAll } from '../html/domClasses.js';
import { addClass } from '../html/domUtils.js';
```

#### Abhängigkeitsbaum

```
routingDragUtils.js
├── routingLinesSvg.js (get_Y_CenterPosition, drawRoutingLine)
│     └─> routingLines.js (routingLinesUnvisible)
├── html/domClasses.js (removeClassFromAll)
├── html/domUtils.js (addClass)
└── main.js (midiBay)
```

#### Exports

```javascript
export { initializeDragLineIfNeeded, calculateDragLinePosition, preventSelect };
```

**Verwendung:**

- `routingDragAndDrop.js` ruft alle 3 Funktionen während Drag

#### Drag-Line-Workflow

```
initializeDragLineIfNeeded(event)
  ├─> if (!dragLine && clickedInPortTag):
        ├─> addClass(clickedInPortTag, 'routing_source')
        ├─> setPointerCapture(event.pointerId)
        └─> dragLine = getDragLine(portTagId)
              ├─> drawRoutingLine(portTagId, portTagId)
              ├─> addClass(line, 'dragline')
              └─> graphTag.appendChild(line)

calculateDragLinePosition(event_x, event_y)
  ├─> dragLine_x2 = event_x - graphTagRect.left
  ├─> dragLine_y2 = event_y - graphTagRect.top
  ├─> updateHoverTargetClasses(event_x, event_y)
  │     ├─> elementFromPoint(event_x, event_y)
  │     └─> if (hoveredTag.classList.contains('output')):
  │           addClass(hoveredTag, 'routing_target')
  │         else:
  │           removeClassFromAll('.routing_target')
  └─> if (routingTarget):
        ├─> dragLine_x2 = graphTagRect.width
        └─> dragLine_y2 = get_Y_CenterPosition(routingTarget.id)
```

#### Selection-Prevention

```
preventSelect()
  ├─> addEventListener('mouseup', onDragEnd)
  ├─> addEventListener('touchend', onDragEnd)
  ├─> addEventListener('touchcancel', onDragEnd)
  └─> addEventListener('selectstart', disableSelect)

onDragEnd()
  └─> removeEventListener(all 4 events)

disableSelect(event)
  └─> event.preventDefault()
```

**Refactoring-Historie:** Zusammengeführt aus `dragLineUtils.js` + `dragSelectUtils.js` (21.12.2025)

---

## Import-Matrix

| Modul                   | Internal Imports | External Imports | Exports | Total Imports |
| ----------------------- | ---------------- | ---------------- | ------- | ------------- |
| routingPorts.js         | 5                | 8                | 3       | 13            |
| routingToggleRouting.js | 2                | 5                | 2       | 7             |
| routingLines.js         | 1                | 5                | 6       | 6             |
| routingLinesSvg.js      | 1 (circular)     | 3                | 3       | 4             |
| routingCssClasses.js    | 0                | 7                | 2       | 7             |
| routingDragAndDrop.js   | 4                | 8                | 1       | 12            |
| routingDragUtils.js     | 1                | 5                | 3       | 6             |

**Legende:**

- **Internal Imports**: Imports aus anderen routing/-Modulen
- **External Imports**: Imports aus anderen Directories
- **Exports**: Anzahl exportierter Funktionen
- **Total Imports**: Gesamtanzahl Import-Statements

---

## Circular Dependencies

### 1. routingPorts.js ⇄ routingDragAndDrop.js

```
routingPorts.js
  ├─> initDragAndDrop() from routingDragAndDrop.js

routingDragAndDrop.js
  └─> storeRoutingOutPortName() from routingPorts.js
```

**Resolution:** Akzeptabel

- Initialisierung und Callback sind getrennt
- Keine zyklische Initialisierungskette
- Function-Reference-Import nur

---

### 2. routingLines.js ↔ routingLinesSvg.js

```
routingLines.js
  ├─> drawRoutingLine() from routingLinesSvg.js
  └─> resetGraphTagPosition() from routingLinesSvg.js

routingLinesSvg.js
  └─> routingLinesUnvisible() from routingLines.js
```

**Resolution:** Akzeptabel

- Nur Helper-Funktion importiert (nicht Core-Logic)
- Keine zyklische Initialisierung
- Könnte durch Utility-Extraction aufgelöst werden (zukünftiges Refactoring)

---

## Coupling-Analyse

### Tightly Coupled (>10 Total Imports)

```
routingPorts.js (13 Imports)
├── Rolle: Routing-Koordinator und Entry-Point
├── Kopplungen: routing/, ports/, storage/, html/, utils/
└── Status: Akzeptabel für Koordinations-Modul

routingDragAndDrop.js (12 Imports)
├── Rolle: Event-Pipeline-Hub
├── Kopplungen: routing/, ports/, html/, utils/
└── Status: Akzeptabel für Event-Hub
```

---

### Loosely Coupled (<7 Total Imports)

```
routingLinesSvg.js (4 Imports)
├── Rolle: SVG-Rendering
├── Kopplungen: routing/ (1), html/ (1), main.js
└── Status: Gut fokussiert

routingLines.js (6 Imports)
├── Rolle: Line-Management
├── Kopplungen: routing/ (1), html/ (2), utils/ (2), main.js
└── Status: Gut strukturiert

routingDragUtils.js (6 Imports)
├── Rolle: Drag-Utilities
├── Kopplungen: routing/ (1), html/ (2), main.js
└── Status: Fokussiert

routingToggleRouting.js (7 Imports)
├── Rolle: Toggle-Logic
├── Kopplungen: routing/ (2), utils/ (2), main.js
└── Status: Gut extrahiert

routingCssClasses.js (7 Imports)
├── Rolle: CSS-Management
├── Kopplungen: routing/ (0!), html/ (2), utils/ (4), main.js
└── Status: Lose gekoppelt (keine routing/-Imports)
```

---

## External Dependencies

### Alle Module importieren von:

- `main.js`: midiBay (globaler State)
- `utils/logger.js`: logger (Debugging)
- `utils/helpers.js`: getPortProperties, forEachPortWithPortProperties, etc.

### Domain-spezifische Dependencies:

#### html/ (DOM-Manipulation):

- `domUtils.js`: setStyles, addClass, removeClass, toggleDisplayClass, getComputedStyleValue, preventAndStop
- `domContent.js`: clearInnerHTML, setAttributes
- `domClasses.js`: removeClassFromAll

#### storage/ (Persistenz):

- `storage.js`: getStorage, setStorage

#### ports/ (Port-System):

- `portSelection.js`: restoreSelectedPort
- `portInteraction.js`: setSelectedPort

---

## Performance-kritische Pfade

### Hot Path: Drag&Drop-Move-Event

```
routingEventMove() (routingDragAndDrop.js)
  ├─> initializeDragLineIfNeeded()           [nur 1x pro Drag]
  ├─> calculateDragLinePosition()            [jeder Move!]
  │     └─> updateHoverTargetClasses()       [elementFromPoint - DOM-Query!]
  └─> setAttributes(dragLine, {x2, y2})      [DOM-Manipulation]
```

**Optimierungen:**

- Lazy-Initialization der Drag-Line (nur bei tatsächlicher Bewegung)
- Pointer-Capture verhindert Event-Verluste
- Keine zusätzliche Throttling (Browser-optimiert)

---

### Hot Path: Routing-Toggle

```
togglePortRouting()
  ├─> toggleRouting()                         [Set-Manipulation]
  │     ├─> outPortSet.add/delete            [O(1)]
  │     ├─> outPortNameSet.add/delete        [O(1)]
  │     └─> drawAllRoutingLines()            [DOM-Heavy!]
  ├─> storeRoutingOutPortName()              [sessionStorage-Write]
  ├─> setInportRoutingClass()                [forEach loop]
  └─> setOutportRoutingClass()               [forEach loop]
```

**Optimierungen:**

- Set-Operationen sind O(1)
- Batch-Updates von CSS-Klassen
- Smart-Redraw in drawAllRoutingLines()

---

### Hot Path: Window-Resize

```
htmlUpdater.js: updateLayout()
  └─> redrawRoutingLines()
        ├─> getBoundingClientRectArray()     [DOM-Query]
        ├─> getRectArrayDiffResult()         [Array-Compare]
        └─> if (diff !== 0): drawAllRoutingLines()  [nur bei Änderung!]
```

**Optimierungen:**

- Change-Detection verhindert unnötige Redraws
- Rect-Caching reduziert DOM-Queries
- RequestAnimationFrame-basiertes Throttling (in htmlUpdater.js)

---

## Refactoring-Opportunities

### Zukünftige Verbesserungen

1. **Circular-Dependency-Resolution**

   ```
   routingLinesUnvisible() → neue Datei routingUtils.js
   ├── Wird von routingLinesSvg.js, routingDragAndDrop.js verwendet
   └── Löst Circular zwischen routingLines.js ↔ routingLinesSvg.js
   ```

2. **Event-Utils-Extraction**

   ```
   getEvent_xy() → neue Datei routingEventUtils.js
   ├── Event-Koordinaten-Normalisierung
   └── Kann mit routingDragUtils.js kombiniert werden
   ```

3. **CSS-Klassen-Konsistenz**

   ```
   Alle CSS-Manipulationen über routingCssClasses.js?
   ├── Momentan: Einige direkt in routingDragAndDrop.js
   └── Prüfen: addClass('routing_source'), removeClass('routing_target')
   ```

4. **Type-Definitions**
   ```
   JSDoc-Types für alle Funktions-Parameter
   ├── Verbessert IDE-Support
   └── Dokumentiert Port-Typen, Event-Typen
   ```

---

## Testing-Strategie

### Unit-Tests (Isoliert testbar)

```
routingToggleRouting.js
├─> toggleRouting() - Pure Logic (Set-Manipulation)
│     ├─> Test: Add routing
│     ├─> Test: Remove routing
│     └─> Test: Symmetric sets

routingLines.js
├─> getBoundingClientRectArray() - Pure Function
├─> getRectArrayDiffResult() - Pure Function
└─> Change-Detection-Logic
```

---

### Integration-Tests (DOM-abhängig)

```
routingDragAndDrop.js
├─> Test: Drag von Input zu Output → Routing erstellt
├─> Test: Drag ohne Drop → Keine Änderungen
└─> Test: Pointer-Capture funktioniert

routingLinesSvg.js
├─> Test: SVG-Elemente korrekt erstellt
├─> Test: Y-Positionen korrekt berechnet
└─> Test: SVG-Overlay korrekt positioniert
```

---

### E2E-Tests (Browser-abhängig)

```
Routing-Persistenz
├─> Test: Routing erstellen → Reload → Wiederhergestellt
├─> Test: Port disconnect → Routing bleibt erhalten
└─> Test: Port reconnect → Routing funktioniert

SVG-Rendering
├─> Test: Window-Resize → Linien repositioniert
├─> Test: Scroll → Linien korrekt berechnet
└─> Test: Multiple Routings → Alle Linien sichtbar
```

---

## Module-Dependency-Matrix

|                      | routingPorts | routingToggle | routingLines | routingLinesSvg | routingCss | routingDrag | routingDragUtils |
| -------------------- | ------------ | ------------- | ------------ | --------------- | ---------- | ----------- | ---------------- |
| **routingPorts**     | -            | ✓             | ✓            | -               | ✓          | ✓           | -                |
| **routingToggle**    | -            | -             | ✓            | -               | ✓          | -           | -                |
| **routingLines**     | -            | -             | -            | ✓               | -          | -           | -                |
| **routingLinesSvg**  | -            | -             | ✓ (circular) | -               | -          | -           | -                |
| **routingCss**       | -            | -             | -            | -               | -          | -           | -                |
| **routingDrag**      | ✓ (circular) | ✓             | ✓            | -               | -          | -           | ✓                |
| **routingDragUtils** | -            | -             | -            | ✓               | -          | -           | -                |

**Legende:**

- ✓ : Modul importiert aus Spalte
- ✓ (circular): Zirkuläre Abhängigkeit
- \- : Keine Abhängigkeit

---

## Best Practices

### ✅ DO

- Smart-Redraw mit Change-Detection nutzen
- Port-Namen für Persistenz verwenden
- Symmetrische Sets pflegen (`inPort.outPortSet` ↔ `outPort.inPortSet`)
- Event-Listener nach Drag-Ende aufräumen
- SVG-Namespace korrekt verwenden
- WeakMap-Lookups minimieren (portProperties als Parameter)

### ❌ DON'T

- Keine blinden Redraws ohne Change-Detection
- Keine direkten Port-Mutationen (nutze portProperties)
- Keine Port-Referenzen für Persistenz (nur Namen!)
- Keine direkte Manipulation von midiBay.lineMap außerhalb routingLines.js
- Keine zusätzliche Event-Throttling (Browser-optimiert via requestAnimationFrame)

---

## Weitere Dokumentation

- **Folder Structure**: `routing-folder-structure.md`
- **Main Architecture**: `folder-structure.md`
- **Main Dependency Graph**: `dependency-graph.md`
- **Code Examples**: `examples.md`

---

**Letzte Aktualisierung:** 21. Dezember 2025  
**Maintainer:** Michael Vorndran  
**Analysierte Module:** 7 (814 LOC total)  
**Status:** Nach routingDragUtils.js + routingToggleRouting.js Refactoring
