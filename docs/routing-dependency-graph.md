# WebMidiBay Routing Module Dependency Graph

Aktualisiert: 21. Dezember 2025

Ebene 1 (Foundation - Minimale Dependencies):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌──────────────────┐ ┌────────────────────────┐
│routingLinesSvg.js│ │routingToggleRouting.js │
│ - SVG Creation │ │ - Toggle Logic. │
│ - Y-Position. │ │ - Set Management. │
└──────────────────┘ └────────────────────────┘
│ │
│ │
▼ ▼
┌──────────────────┐ ┌──────────────────────┐
│ routingLines.js │ │ routingCssClasses.js │
│ - Line Map │ │ - CSS Updates │
│ - Smart Redraw │ │ - Highlighting │
└──────────────────┘ └──────────────────────┘
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
┌──────────────────────────┐
│ routingDragUtils.js │
│ - Drag Line Creation │
│ - Position Calculation │
│ - Selection Prevention │
│ imports: routingLinesSvg │
└──────────────────────────┘
│
▼
Ebene 3 (Event Layer):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│ routingDragAndDrop.js │
│ imports: │
│ - routingLines (visibility check) │
│ - routingToggleRouting (toggle action) │
│ - storagePort (storage callback) │
│ - routingDragUtils (utilities) │
│ Event Pipeline: │
│ - pointerdown → pointermove → pointerup │
└────────────────────────────────────────────┘
│
▼
Ebene 4 (Orchestrator - Entry Point):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│ routingPorts.js │
│ imports: │
│ - routingLines (init) │
│ - routingDragAndDrop (init) │
│ - routingCssClasses (CSS updates) │
│ - routingToggleRouting (toggle) │
│ - storagePort (restore/store routing) │
│ Orchestrator Functions: │
│ - initRouting() │
│ - storeRoutingOutPortName() │
│ - restoreRoutingOutPortName() │
│ - resetOutPortSet() / resetInPortSet() │
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

Circular Dependencies: Keine mehr vorhanden (Stand: 21.12.2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design Pattern:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Layered Architecture (4 Ebenen)
✓ Orchestrator Pattern (routingPorts als Entry Point)
✓ Smart-Redraw mit Change-Detection
✓ Port-Namen statt Refs für Persistenz
✓ Symmetrische Sets (inPort.outPortSet ↔ outPort.inPortSet)
