js/routing/
│
├── routingPorts.js (148 Zeilen) - ⚡ Orchestrator/Entry Point
│ ├─ initRouting() - Main initialization
│ ├─ storeRoutingOutPortName() - Persist to sessionStorage
│ ├─ restoreRoutingOutPortName() - Load from sessionStorage
│ ├─ resetOutPortSet() - Port-Namen → Port-Refs
│ ├─ resetInPortSet() - Symmetrische Sets
│ └─ resetAllRouting() - Clear all routing
│ └─ Dependencies:
│ ├─── routingLines.js (initRoutingLines)
│ ├─── routingDragAndDrop.js (initDragAndDrop)
│ ├─── routingCssClasses.js (setInportRoutingClass, setOutportRoutingClass)
│ └─── routingToggleRouting.js (toggleRouting)
│
├── routingToggleRouting.js (63 Zeilen) - Toggle Logic Layer [NEU]
│ ├─ togglePortRouting() - High-Level Toggle + UI
│ └─ toggleRouting() - Low-Level Set-Manipulation
│ └─ Dependencies:
│ ├─── routingLines.js (drawAllRoutingLines)
│ └─── routingCssClasses.js (CSS updates)
│
├── routingLines.js (97 Zeilen) - SVG Line Management Layer
│ ├─ initRoutingLines() - Init lineMap & SVG
│ ├─ drawAllRoutingLines() - Redraw all connections
│ ├─ redrawRoutingLines() - Smart-Redraw with Change-Detection
│ ├─ routingLinesUnvisible() - Visibility check
│ ├─ getBoundingClientRectArray() - Rect-Caching
│ └─ getRectArrayDiffResult() - Change-Detection
│ └─ Dependencies:
│ └─── routingLinesSvg.js (drawRoutingLine, resetGraphTagPosition)
│
├── routingLinesSvg.js (100 Zeilen) - SVG Element Creation Layer
│ ├─ drawRoutingLine() - Creates SVG <line> element
│ ├─ get_Y_CenterPosition() - Y-Position calculation
│ └─ resetGraphTagPosition() - SVG-Overlay positioning
│ └─ Dependencies:
│ └─── routingLines.js (routingLinesUnvisible) ⚠️ Circular!
│
├── routingCssClasses.js (151 Zeilen) - CSS State Management Layer
│ ├─ setInportRoutingClass() - Mark routed inputs
│ ├─ setOutportRoutingClass() - Orchestrates output CSS
│ ├─ updateSelectedRoutingLines() - Highlight selected lines
│ └─ markConnectedOutputPorts() - Mark connected outputs
│ └─ Dependencies: KEINE routing/-Imports! (Pure CSS-Logic)
│
├── routingDragAndDrop.js (158 Zeilen) - Event Pipeline Layer
│ ├─ initDragAndDrop() - Register event listeners
│ ├─ routingEventStart() - pointerdown handler
│ ├─ routingEventMove() - pointermove handler
│ └─ routingEventEnd() - pointerup handler
│ └─ Dependencies:
│ ├─── routingLines.js (routingLinesUnvisible)
│ ├─── routingToggleRouting.js (togglePortRouting)
│ ├─── routingPorts.js (storeRoutingOutPortName) ⚠️ Circular!
│ └─── routingDragUtils.js (ALL utilities)
│
└── routingDragUtils.js (97 Zeilen) - Drag Utilities Layer [REFACTORED]
├─ initializeDragLineIfNeeded() - Lazy drag-line creation
├─ calculateDragLinePosition() - Endpoint calculation
└─ preventSelect() - Text selection prevention
└─ Dependencies:
└─── routingLinesSvg.js (get_Y_CenterPosition, drawRoutingLine)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Design Pattern: Layered Architecture + Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Layer 1: Foundation (LinesSvg, ToggleRouting, CssClasses) - Minimal deps
✓ Layer 2: Management (Lines, DragUtils) - Uses Layer 1
✓ Layer 3: Events (DragAndDrop) - Uses Layer 2
✓ Layer 4: Orchestrator (Ports) - Entry Point

✓ 2 Circular Dependencies (beide akzeptabel)
✓ routingPorts als zentrale Facade für main.js
✓ Smart-Redraw: Change-Detection vermeidet unnötige SVG-Updates
✓ Port-Namen für Persistenz (Hot-Plug-Stabilität)

Refactoring-Historie (Dez 2025):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ dragLineUtils.js + dragSelectUtils.js → routingDragUtils.js
✅ togglePortRouting + toggleRouting → routingToggleRouting.js (aus routingPorts)

### routingPorts.js (148 Zeilen)

**Zweck:** Zentrale Routing-State-Verwaltung und sessionStorage-Persistenz

**Exports:**

```javascript
export { initRouting, resetAllRouting, storeRoutingOutPortName };
```

**Kern-Verantwortlichkeiten:**

- Routing-Initialisierung (`initRouting()`)
- Persistenz von Routing-Konfigurationen (Port-Namen-basiert)
- Synchronisation zwischen Live-Routing-Sets und gespeicherten Namen
- Symmetrische Verwaltung von `inPort.outPortSet` ↔ `outPort.inPortSet`
- Routing-Reset-Funktionalität

**Wichtige Funktionen:**

- `storeRoutingOutPortName()` - Speichert Routing als Port-Namen (Hot-Plug-Stabilität)
- `restoreRoutingOutPortName()` - Lädt gespeicherte Routing-Konfiguration
- `resetOutPortSet()` / `resetInPortSet()` - Synchronisiert Live-Ports mit Namen
- `assignMidiPortFunctions()` - Weist `midiBay.toggleRouting` etc. zu

**Design-Pattern:**

- Port-Namen statt Port-Referenzen für Persistenz
- Symmetrische Routing-Sets (Input → Output UND Output → Input)

---

### routingToggleRouting.js (63 Zeilen) **[NEU]**

**Zweck:** Toggle-Logik für Routing-Verbindungen

**Exports:**

```javascript
export { togglePortRouting, toggleRouting };
```

**Kern-Verantwortlichkeiten:**

- Toggle-Logik für Routing-Verbindungen (an/aus)
- Koordination von Live-Routing (`outPortSet`) und Persistenz (`outPortNameSet`)
- Symmetrische Aktualisierung von Input- und Output-Port-Sets
- Clock-Source-Tracking-Updates bei Routing-Änderungen
- UI-Trigger über `drawAllRoutingLines()`

**Wichtige Funktionen:**

- `togglePortRouting(inPort, outPort, callback)` - High-Level Toggle mit UI-Update
- `toggleRouting(inPort, outPort)` - Low-Level Toggle-Logik (wird von `midiBay.toggleRouting` verwendet)

**Design-Pattern:**

- Dependency Injection für Storage-Callback
- Teil der öffentlichen API (`midiBay.toggleRouting`)

---

### routingLines.js (97 Zeilen)

**Zweck:** SVG-Linien-Management und Redraw-Koordination

**Exports:**

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

**Kern-Verantwortlichkeiten:**

- Initialisierung von `midiBay.lineMap` (LineID → SVG-Element)
- Zeichnen aller Routing-Linien basierend auf `inPort.outPortSet`
- Smart-Redraw: Nur bei Container-Größenänderungen neu zeichnen
- Sichtbarkeitsprüfung (`routingLinesUnvisible()`)
- Change-Detection für Performance-Optimierung

**Wichtige Funktionen:**

- `initRoutingLines()` - Initialisiert SVG-Container und LineMap
- `drawAllRoutingLines()` - Zeichnet alle Verbindungen neu
- `redrawRoutingLines()` - Smart-Redraw mit Change-Detection
- `getBoundingClientRectArray()` / `getRectArrayDiffResult()` - Rect-Diff-Utils

**Design-Pattern:**

- Smart-Redraw mit Rect-Caching
- Change-Detection zur Vermeidung unnötiger Redraws

---

### routingLinesSvg.js (100 Zeilen)

**Zweck:** SVG-Element-Erstellung und Positionsberechnung

**Exports:**

```javascript
export { drawRoutingLine, get_Y_CenterPosition, resetGraphTagPosition };
```

**Kern-Verantwortlichkeiten:**

- SVG-Line-Element-Erstellung (`createElementNS`)
- Y-Positions-Berechnung für Port-Tag-Mittelpunkte
- Positionierung des SVG-Graph-Containers
- Koordinaten-Transformation (Port-Rects → SVG-Space)

**Wichtige Funktionen:**

- `drawRoutingLine(inPortTagId, outPortTagId)` - Erstellt SVG-Linie
- `get_Y_CenterPosition(portTagId)` - Berechnet Y-Mittelpunkt relativ zu Graph
- `resetGraphTagPosition()` - Positioniert SVG-Overlay zwischen Port-Listen

**Design-Pattern:**

- SVG-Namespace-Handling
- Koordinaten-Transformation für Overlay-Rendering

---

### routingCssClasses.js (151 Zeilen)

**Zweck:** CSS-Klassen-Management für Routing-Visualisierung

**Exports:**

```javascript
export { setInportRoutingClass, setOutportRoutingClass };
```

**Kern-Verantwortlichkeiten:**

- CSS-Klassen für Routing-Status (`routed_to_output`, `routed_to_input`)
- Selected-Port-Highlighting (Linien + Connected-Ports)
- Routing-Visualisierung bei Port-Selection
- Update von `midiBay.lineMap` für Selected-State

**Wichtige Funktionen:**

- `setInportRoutingClass()` - Markiert Input-Ports mit aktiven Verbindungen
- `setOutportRoutingClass()` - Koordiniert Output-Port-Visualisierung
- `setSelectRoutetOutportRoutingClass()` - Hebt verbundene Outputs bei Selection hervor
- `updateSelectedRoutingLines()` - Markiert Linien zum Selected-Port

**Design-Pattern:**

- Separation of Concerns: CSS-Klassen-Logik getrennt von Routing-Logic
- Performance: Bulk-Remove-Operation mit `removeClassFromAll()`

---

### routingDragAndDrop.js (158 Zeilen)

**Zweck:** Drag&Drop-Event-Pipeline für Routing-Erstellung

**Exports:**

```javascript
export { initDragAndDrop };
```

**Kern-Verantwortlichkeiten:**

- Event-Listener-Registration auf Input-Ports
- Drag-Event-Pipeline: `pointerdown` → `pointermove` → `pointerup`
- Hover-Detection auf Output-Ports während Drag
- Routing-Toggle bei erfolgreichem Drop
- Visual-Feedback während Drag (Drag-Line, CSS-Klassen)

**Wichtige Funktionen:**

- `initDragAndDrop()` - Registriert Event-Listener
- `routingEventStart(event)` - Initiiert Drag-Operation
- `routingEventMove(event)` - Aktualisiert Drag-Line während Bewegung
- `routingEventEnd(event)` - Finalisiert Drag, triggert Routing-Toggle

**Design-Pattern:**

- Event-Delegation mit Pointer-Events
- State-Machine: Drag-nur-bei-aktivem-Routing-Modus
- Cleanup nach Event-Ende

---

### routingDragUtils.js (97 Zeilen) **[REFACTORED]**

**Zweck:** Drag-Line-Utilities und Selection-Prevention

**Exports:**

```javascript
export { initializeDragLineIfNeeded, calculateDragLinePosition, preventSelect };
```

**Kern-Verantwortlichkeiten:**

- Drag-Line-Erstellung und -Positionierung während Drag
- Hover-Target-Detection und CSS-Klassen-Update
- Text-Selection-Prevention während Drag-Operationen
- PointerCapture-Management

**Wichtige Funktionen:**

- `initializeDragLineIfNeeded(event)` - Erstellt temporäre Drag-Line beim ersten Move
- `calculateDragLinePosition(event_x, event_y)` - Berechnet Endpunkt der Drag-Line
- `updateHoverTargetClasses(event_x, event_y)` - Markiert Output-Ports bei Hover
- `preventSelect()` - Verhindert Text-Selektion während Drag

**Design-Pattern:**

- Lazy-Initialization (Drag-Line nur bei tatsächlicher Bewegung)
- Event-Listener-Cleanup nach Drag-Ende

**Refactoring-Historie:**

- Zusammengeführt aus `dragLineUtils.js` + `dragSelectUtils.js` (21.12.2025)

---

## Datenfluss

### Initialisierung

```
main.js: initRouting()
  ↓
routingPorts.js
  ├── restoreRoutingOutPortName()         → Load from sessionStorage
  ├── resetOutPortSet()                   → Port-Namen → Port-Refs
  ├── resetInPortSet()                    → Symmetrische Sets
  ├── setInportRoutingClass()             → CSS-Klassen
  ├── setOutportRoutingClass()            → CSS-Klassen
  ├── initRoutingLines()                  → SVG-Init
  └── initDragAndDrop()                   → Event-Registration
```

### Routing-Toggle (via UI)

```
User Drag Input → Output
  ↓
routingDragAndDrop.js: routingEventEnd()
  ↓
routingToggleRouting.js: togglePortRouting()
  ↓
  ├── toggleRouting()                     → Set-Manipulation
  │     ├── outPortSet.add/delete
  │     ├── outPortNameSet.add/delete
  │     ├── inPortSet.add/delete
  │     └── activeClockSourceSet.delete
  │
  ├── storeRoutingOutPortName()           → Persist to sessionStorage
  ├── setInportRoutingClass()             → Update Input-CSS
  ├── setOutportRoutingClass()            → Update Output-CSS
  └── drawAllRoutingLines()               → Redraw SVG
```

### SVG-Rendering

```
drawAllRoutingLines()
  ↓
routingLines.js
  ├── Clear lineMap + SVG
  ├── resetGraphTagPosition()             → Position SVG-Overlay
  └── For each inPort.outPortSet:
        ├── drawRoutingLine(inTagId, outTagId)
        │     ↓
        │   routingLinesSvg.js
        │     ├── get_Y_CenterPosition(inTagId)
        │     ├── get_Y_CenterPosition(outTagId)
        │     └── createElementNS('line')
        │
        └── lineMap.set(lineId, line)
```

### Drag&Drop-Flow

```
pointerdown on Input-Port
  ↓
routingEventStart()
  ├── Set clickedInPortTag
  ├── Register pointermove/pointerup
  └── preventSelect()

pointermove
  ↓
routingEventMove()
  ├── initializeDragLineIfNeeded()
  │     └── getDragLine() → Create temporary SVG-Line
  ├── calculateDragLinePosition()
  │     └── updateHoverTargetClasses()
  └── Update line x2/y2 attributes

pointerup
  ↓
routingEventEnd()
  ├── Get elementFromPoint (Hover-Target)
  ├── Remove CSS-Klassen
  ├── togglePortRouting() if dropped on Output
  └── Cleanup: remove dragLine, clickedInPortTag
```

---

## Abhängigkeiten

### Interne Abhängigkeiten (routing/)

```
routingPorts.js
  ├─> routingLines.js (initRoutingLines)
  ├─> routingDragAndDrop.js (initDragAndDrop)
  ├─> routingCssClasses.js (setInportRoutingClass, setOutportRoutingClass)
  └─> routingToggleRouting.js (toggleRouting)

routingToggleRouting.js
  ├─> routingLines.js (drawAllRoutingLines)
  └─> routingCssClasses.js (setInportRoutingClass, setOutportRoutingClass)

routingLines.js
  └─> routingLinesSvg.js (drawRoutingLine, resetGraphTagPosition)

routingLinesSvg.js
  └─> routingLines.js (routingLinesUnvisible) ⚠️ Circular!

routingCssClasses.js
  └─> (keine routing/-Imports)

routingDragAndDrop.js
  ├─> routingLines.js (routingLinesUnvisible)
  ├─> routingToggleRouting.js (togglePortRouting)
  ├─> routingPorts.js (storeRoutingOutPortName)
  └─> routingDragUtils.js (initializeDragLineIfNeeded, calculateDragLinePosition, preventSelect)

routingDragUtils.js
  └─> routingLinesSvg.js (get_Y_CenterPosition, drawRoutingLine)
```

**Circular Dependency:**

- `routingLines.js` ↔ `routingLinesSvg.js` (indirekt, über `routingLinesUnvisible()`)

**Resolution:** Akzeptabel, da nur Helper-Funktion importiert wird.

---

### Externe Abhängigkeiten

#### Alle Module importieren:

- `midiBay` aus `../main.js` (globaler State)
- `logger` aus `../utils/logger.js` (Debugging)
- `getPortProperties` aus `../utils/helpers.js` (WeakMap-Zugriff)

#### Domain-spezifische Abhängigkeiten:

**html/** (DOM-Manipulation):

- `domUtils.js`: setStyles, addClass, removeClass, toggleDisplayClass, getComputedStyleValue, preventAndStop
- `domContent.js`: clearInnerHTML, setAttributes
- `domClasses.js`: removeClassFromAll

**storage/**:

- `storage.js`: getStorage, setStorage (sessionStorage-Abstraktion)

**ports/**:

- `portSelection.js`: restoreSelectedPort (von routingPorts.js)
- `portInteraction.js`: setSelectedPort (von routingDragAndDrop.js)

---

## Import-Matrix

| Modul                   | Imports from routing/ | Imports external | Exports |
| ----------------------- | --------------------- | ---------------- | ------- |
| routingPorts.js         | 5                     | 7                | 3       |
| routingToggleRouting.js | 2                     | 3                | 2       |
| routingLines.js         | 1                     | 4                | 6       |
| routingLinesSvg.js      | 1 (circular)          | 2                | 3       |
| routingCssClasses.js    | 0                     | 4                | 2       |
| routingDragAndDrop.js   | 4                     | 8                | 1       |
| routingDragUtils.js     | 1                     | 3                | 3       |

**Legende:**

- **Imports from routing/**: Imports aus anderen routing/-Modulen
- **Imports external**: Imports aus anderen Directories (main.js, utils/, html/, etc.)
- **Exports**: Anzahl exportierter Funktionen

---

## Coupling-Analyse

### Tightly Coupled (>5 externe Abhängigkeiten)

- `routingDragAndDrop.js` (8 externe) - Event-Koordinations-Hub
- `routingPorts.js` (7 externe) - Routing-Manager

**Status:** Akzeptabel für Koordinations-Module

### Loosely Coupled (<5 externe Abhängigkeiten)

- `routingLinesSvg.js` (2 externe) - Fokussiert auf SVG-Rendering
- `routingDragUtils.js` (3 externe) - Fokussierte Utilities
- `routingToggleRouting.js` (3 externe) - Fokussierte Toggle-Logic
- `routingLines.js` (4 externe) - Line-Management
- `routingCssClasses.js` (4 externe) - CSS-Management

**Status:** Gut strukturiert, fokussierte Verantwortlichkeiten

---

## Refactoring-Historie

### Abgeschlossene Refactorings (Dez 2025)

1. **Verwaiste Exports entfernt** (vorher)

   - `toggleRouting`, `resetRoutingSets` aus routingPorts.js (nur intern als midiBay-Properties)
   - `updateSelectedRoutingLines` aus routingCssClasses.js (nur intern)
   - `resetGraphTagPosition` aus routingLinesSvg.js (nur intern)
   - routingLines.js: 71 → 31 Zeilen (-56%)

2. **Drag-Utilities zusammengeführt** (21.12.2025)

   - `dragLineUtils.js` + `dragSelectUtils.js` → `routingDragUtils.js`
   - 2 kleine Dateien → 1 fokussiertes Modul (97 Zeilen)
   - Sektionen: DRAG LINE UTILITIES + DRAG SELECT PREVENTION

3. **Toggle-Logik extrahiert** (21.12.2025)
   - `togglePortRouting()` + `toggleRouting()` aus routingPorts.js → `routingToggleRouting.js`
   - routingPorts.js: 204 → 148 Zeilen (-27%)
   - Dependency Injection für Storage-Callback eingeführt

**Ergebnis:**

- routingPorts.js fokussierter (keine Toggle-Logic mehr)
- Bessere Separation of Concerns
- Einfacheres Testing (Toggle-Logic isoliert)

---

## Performance-Überlegungen

### SVG-Rendering

- **Smart-Redraw:** Nur bei Container-Größenänderungen
- **Change-Detection:** Rect-Caching mit Diff-Berechnung
- **Lazy-Rendering:** Drag-Line erst bei tatsächlicher Bewegung

### Routing-Toggle

- **WeakMap-Optimierung:** `portProperties` als Parameter (vermeidet Lookups)
- **Symmetrische Sets:** O(1) Lookup für `isRouting()` Checks
- **Batch-Updates:** CSS-Klassen-Updates nach Toggle gebündelt

### Drag&Drop

- **Pointer-Capture:** Verhindert Event-Verlust bei schneller Bewegung
- **Throttling:** Keine zusätzliche Throttling (Browser-optimiert via requestAnimationFrame in anderen Modulen)
- **Event-Cleanup:** Listener-Removal nach Drag-Ende

---

## Best Practices

### ✅ DO

- Port-Namen für Persistenz verwenden (Hot-Plug-Stabilität)
- Symmetrische Routing-Sets pflegen (`inPort.outPortSet` ↔ `outPort.inPortSet`)
- SVG-Namespace korrekt verwenden (`createElementNS`)
- Event-Listener nach Drag-Ende aufräumen
- Change-Detection für Performance-Optimierung nutzen

### ❌ DON'T

- Keine direkten Port-Mutationen (nutze `portProperties.outPortSet`)
- Keine blinden Redraws ohne Change-Detection
- Keine direkte Manipulation von `midiBay.lineMap` außerhalb von routingLines.js
- Keine Port-Referenzen für Persistenz (nur Namen!)

---

## Zukünftige Refactorings

### Geplante Verbesserungen

1. **Circular Dependency auflösen**

   - `routingLinesUnvisible()` aus routingLines.js extrahieren
   - In separate Utility-Datei verschieben

2. **Event-Utils prüfen**

   - `getEvent_xy()` in routingDragAndDrop.js könnte extrahiert werden
   - Möglicherweise mit routingDragUtils.js zusammenführen

3. **CSS-Klassen-Konsistenz**
   - Prüfen ob alle CSS-Klassen-Updates über routingCssClasses.js laufen
   - Momentan: Manche Updates in routingDragAndDrop.js direkt

---

## Testing-Hinweise

### Kritische Test-Szenarien

1. **Routing-Persistenz:**

   - Routing erstellen → Reload → Routing sollte wiederhergestellt sein
   - Port disconnecten → Routing sollte beim Reconnect funktionieren

2. **Drag&Drop:**

   - Drag von Input zu Output → Routing sollte erstellt werden
   - Drag ohne Drop → Keine Änderungen
   - Schnelle Drag-Bewegungen → Keine Event-Verluste

3. **SVG-Rendering:**

   - Window-Resize → Linien sollten korrekt repositioniert werden
   - Port-Liste scrollbar → Linien sollten korrekt berechnet werden
   - Routing-Mode toggle → SVG sollte ein-/ausgeblendet werden

4. **Clock-Source-Tracking:**
   - Routing zu Output mit Clock → `activeClockSourceSet` sollte aktualisiert werden
   - Routing entfernen → Clock-Source sollte entfernt werden

---

## Weitere Dokumentation

- **Dependency Graph**: `routing-dependency-graph.md`
- **Main Architecture**: `folder-structure.md`
- **Code Examples**: `examples.md`
- **README**: `../README.md`

---

**Letzte Aktualisierung:** 21. Dezember 2025  
**Maintainer:** Michael Vorndran  
**Status:** Nach routingDragUtils.js + routingToggleRouting.js Refactoring
