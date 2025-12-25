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
│ └─── routingLines.js (routingLinesUnvisible)
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
│ ├─── storagePort.js (storeRoutingOutPortName)
│ └─── routingDragUtils.js (ALL utilities)
│
└── storagePort.js (NEU) - Routing-spezifische Storage-Logik
├─ storeRoutingOutPortName() - Persist to sessionStorage
└─ restoreRoutingOutPortName() - Load from sessionStorage

**Layered Structure:**

1. Orchestrator: routingPorts.js
2. Event Layer: routingDragAndDrop.js
3. Utilities: routingDragUtils.js
4. Foundation: routingLines.js, routingLinesSvg.js, routingCssClasses.js, routingToggleRouting.js
5. Storage: storagePort.js

**Storage:**

- Routing-Persistenz (store/restore): storagePort.js

**Hinweis:**

- Port-Namen statt Referenzen für Persistenz
- Keine zirkulären Abhängigkeiten (Stand: 21.12.2025)

```
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
│ ├─── routingPorts.js (storeRoutingOutPortName)
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
```
