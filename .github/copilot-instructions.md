# WebMidiBay - Anweisungen für KI-Coding-Agents

## Projektübersicht

WebMidiBay ist ein browserbasiertes MIDI-Routing- und Monitoring-Tool, das mit Vanilla JavaScript und der Web MIDI API entwickelt wurde. Kein Build-Prozess - Dateien werden direkt als ES6-Module geladen. Die App ermöglicht Echtzeit-MIDI-Routing, Nachrichtenfilterung, SysEx-Verarbeitung und visuelles Signal-Feedback.

## Architektur

### Kern-Datenfluss

1. **MIDI Input** → [midiMessage.js](../js/midiMessage.js) `receiveMIDIMessage()` empfängt rohe Web MIDI API Events
2. **Filterung** → [midiMessageFilter.js](../js/core/midiMessageFilter.js) wendet globale + port-spezifische Filter an
3. **Routing** → Input-Ports senden an ihre verbundenen Output-Ports via `outPort.send(midiMessage.data)`
4. **Visualisierung** → [midiMessageSignal.js](../js/core/midiMessageSignal.js) verwaltet CSS-basierte visuelle Signale (Blinken, Clock-Indikatoren)
5. **Monitor** → [htmlMessage.js](../js/html/htmlMessage.js) zeigt gefilterte/ungefilterte Nachrichten in Echtzeit

### Zentrales State-Objekt: `midiBay`

Definiert in [main.js](../js/main.js), `midiBay` ist der globale State-Container:

- `inNameMap` / `outNameMap`: Maps von Port-Namen → Web MIDI API Port-Objekten
- `portPropertiesManager`: Verwaltet Port-Metadaten OHNE native Web MIDI Port-Objekte zu mutieren
- `globalFilterSet`: Aktive MIDI-Nachrichten-Typ-Filter (nach Status-Byte)
- `selectedPort`: Aktuell ausgewählter Port für port-spezifische Operationen
- `signalsEnabled`: Globaler Toggle für visuelles Feedback

### Port-Metadaten-Pattern

**Kritisch:** Web MIDI API Port-Objekte niemals direkt mutieren. Verwende [portProperties.js](../js/portProperties.js):

- `PortPortProperties` Klasse speichert Routing-Sets, Filter, Aliase, DOM-Referenzen
- Zugriff via `getPortProperties(port)` aus [helpers.js](../js/utils/helpers.js)
- Routing-Verbindungen gespeichert als: `portProperties.outPortSet` (Live-Port-Refs) + `outPortNameSet` (für Persistenz)

### Storage-Strategie

- **sessionStorage** (nicht localStorage) via [storage.js](../js/storage/storage.js)
- Alle Keys mit `WMB_` Prefix
- Port-Referenzen als Namen (Strings) für Hot-Plug-Stabilität gespeichert
- Routing, Filter, Aliase und UI-State bleiben über Reloads erhalten

## Wichtige Patterns

### Modul-Struktur

```javascript
// Standard Export-Pattern
export { publicFunction1, publicFunction2 };
import { dependency } from './otherModule.js';

// Initialisierung in main.js via IIFE
(function () {
  navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess);
})();
```

### DOM-Manipulation

Verwende Helper-Funktionen aus dem [html/](../js/html/) Verzeichnis:

- `addClass()`, `removeClass()`, `toggleDisplayClass()` aus [domStyles.js](../js/html/domStyles.js)
- `clearNode()`, `setAttributes()` aus [domContent.js](../js/html/domContent.js)
- Niemals `innerHTML` für dynamischen Content verwenden - nutze Text/DOM-Erstellungsfunktionen

### Signal-Timing-Pattern

Visuelle Signale verwenden CSS-Klassen + `setTimeout()` Cleanup:

```javascript
addClass(portProbs.tag, 'insignal');
setTimeout(() => {
  removeClass(portProbs.tag, 'insignal');
}, 400);
```

### Filter-Implementierung

Zwei-Schichten-Filtersystem:

1. **Globale Filter** (`midiBay.globalFilterSet`) - gelten für alle Ports
2. **Port-spezifische Filter** (`portProperties.filterSet`) - gelten für einzelne Ports

- Filter verwenden MIDI-Status-Byte-Strings (z.B. "176" für CC, "248" für Clock)
- Channel-Filterung separat: `channel.filter` (0 = aus, 1-16 = ausgewählter Channel)

## Entwicklungsrichtlinien

### Kein Build-Step

- Öffne [index.html](../index.html) direkt in Chrome/Edge/Opera (Firefox Desktop 108+ unterstützt)
- Änderungen werden beim Neuladen der Seite reflektiert (Cache in Meta-Tags deaktiviert)
- Verwende ES6-Module mit `.js` Erweiterungen in Import-Statements

### Debugging

- Verwende `logger.debug()` aus [utils/logger.js](../js/utils/logger.js) statt `console.log`
- Logger unterstützt gestylte Console-Ausgabe: `logger.debug('%c message', 'color: orange')`
- Prüfe Browser-Konsole auf Web MIDI API Zugriffsfehler

### Code-Style

- **Prettier-Konfiguration**: 100 Zeichen Zeilenbreite, 2 Spaces, Single Quotes, Semicolons
- Variablen-Naming: camelCase für Funktionen/Variablen, PascalCase für Klassen
- Deutsche Kommentare akzeptabel (Legacy-Code), Englisch bevorzugt für neuen Code
- Verwende `'use strict'` nur in Modulen, die es explizit benötigen

### Performance-Überlegungen

- Monitor-Sichtbarkeit beeinflusst Performance - prüfe `#monitor.js-hidden` vor DOM-Updates
- MIDI-Clock-Nachrichten (Status-Byte 248) fluten das System - puffern/reduzieren via `reducedClockAndActiveSensingMessages()`
- Routing-Signale können global deaktiviert werden via `midiBay.signalsEnabled`

## Häufige Aufgaben

### Neuen MIDI-Filter-Typ hinzufügen

1. Aktualisiere Filter-UI in [index.html](../index.html) `<section id="filter">`
2. Füge Status-Byte-Handling in [midiMessageFilter.js](../js/core/midiMessageFilter.js) hinzu
3. Aktualisiere Filter-CSS-Klassen in [filterCss.js](../js/filter/filterCss.js)

### Neues Port-Routing erstellen

1. Hole Port-Metadaten: `const inPortProbs = getPortProperties(inPort)`
2. Füge zum Routing-Set hinzu: `inPortProbs.outPortSet.add(outPort)`
3. Aktualisiere Name-Set für Persistenz: `inPortProbs.outPortNameSet.add(outPort.name)`
4. Speichere Konfiguration: `storeRoutingOutPortName()` aus [routingPorts.js](../js/routing/routingPorts.js)
5. Zeichne visuelle Linien neu: `drawAllRoutingLines()` aus [routingLines.js](../js/routing/routingLines.js)

### UI-Event-Handler hinzufügen

- Registriere in [htmlEvents.js](../js/html/htmlEvents.js) via `setEventListener()`
- Verwende `preventAndStop(event)` aus [domStyles.js](../js/html/domStyles.js) um Propagierung zu stoppen

## Datei-Organisation

- **js/core/**: Kern-MIDI-Nachrichtenverarbeitung (Filter, Signal)
- **js/routing/**: Routing-Logik, Drag-and-Drop, visuelle Linien
- **js/html/**: Alle DOM-Manipulation und UI-Updates
- **js/filter/**: Filter-System (Daten, CSS, Channel)
- **js/storage/**: sessionStorage-Abstraktion
- **js/utils/**: Helpers, Logging, MIDI-Utilities
- **css/**: Nach Funktionsbereichen getrennt (style, tables, info, variables)

## Erweiterte Features (teilweise in Entwicklung)

### Multiple Clock Source Detection

**Problem:** Wenn ein MIDI-Output Clock-Signale von mehreren Input-Ports gleichzeitig empfängt, werden die MIDI-Instrumente asynchron und das Timing wird inkonsistent. Dies ist ein kritischer Fehler im Routing-Setup, der unbedingt vermieden werden muss, da er die Synchronisation zwischen MIDI-Instrumenten sabotiert.

**Zweck:** Das System erkennt diese problematische Situation automatisch und warnt den Benutzer visuell, damit er das Routing korrigieren kann.

**Implementierung** in [midiMessageSignal.js](../js/core/midiMessageSignal.js):

- Jeder Output-Port hat ein `activeClockSourceSet` (Set von Input-Ports, die aktiv Clock senden)
- `trackClockSourceForOutput()` fügt Input-Ports zum Set hinzu, sobald sie Clock-Signale senden
- `startRecurringTimer()` prüft alle 1s ob Clock-Signal noch aktiv ist und entfernt inaktive Quellen automatisch
- `trackOutputClockSources()` setzt CSS-Klasse `multiple_clock_sources` auf dem Output-Port, wenn mehr als eine aktive Clock-Quelle erkannt wird → **visuelles Warning für den Benutzer**
- `checkActiveClockSourcesForOutputPorts()` berücksichtigt gefilterte Clock-Quellen (werden nicht gezählt)

**Wichtig:** Clock-Filter (Status-Byte 248) werden berücksichtigt - gefilterte Quellen lösen keine Warnung aus, da sie das Instrument nicht erreichen.

### MIDI Feedback Loop Detection

**Problem:** Wenn dieselbe MIDI-Nachricht sofort zurückkommt (z.B. durch zirkuläres Routing), kann das System flooden.

**Implementierung** in [midiMessage.js](../js/midiMessage.js) `isMidiLoop()`:

- Vergleicht eingehende Nachricht mit `portProps.lastData` des Output-Ports
- Prüft nur 3-Byte-Messages (Note, CC, etc.) für Performance
- Vergleicht alle 3 Bytes auf einmal
- Bei Loop: Nachricht wird als gefiltert markiert und Loop-Warning im Monitor angezeigt
- `logger.warn()` gibt Warnung in Console aus

**Pattern:**

```javascript
const isLoop =
  formerData &&
  formerData.length === 3 &&
  formerData[0] === midiData[0] &&
  formerData[1] === midiData[1] &&
  formerData[2] === midiData[2];
```

## SVG-Routing-Lines System

### Architektur

Die visuellen Routing-Verbindungen werden als SVG-Linien zwischen Input- und Output-Port-Tags gezeichnet.

**Kern-Komponenten** in [routingLinesSvg.js](../js/routing/routingLinesSvg.js):

1. **Koordinaten-Berechnung:**

   - `get_Y_CenterPosition(portTagId)` berechnet vertikale Mittelposition eines Port-Tags relativ zum SVG-Graph
   - `getBoundingClientRectArray()` erfasst Container-Dimensionen als Array
   - `getRectArrayDiffResult()` vergleicht alte/neue Dimensionen für Change-Detection

2. **Line-Management:**

   - `drawRoutingLine(inPortTagId, outPortTagId)` erstellt einzelne SVG-Linie mit Koordinaten
   - `drawAllRoutingLines()` zeichnet alle Verbindungen aus `inMeta.outPortSet` neu
   - `redrawRoutingLines()` Smart-Update: prüft Container-Größe und zeichnet nur bei Änderungen neu
   - Linien gespeichert in `midiBay.lineMap` (Map mit Line-ID → SVG-Element)

3. **Positioning:**
   - `resetGraphTagPosition()` aktualisiert Position und Größe des SVG-Containers
   - SVG-Koordinaten relativ zu `midiBay.graphTagRect` (Graph-Container-Bounds)

**Line-ID-Pattern:** `${inPortTagId}-${outPortTagId}` für eindeutige Identifikation und Signal-Mapping

**Performance:** Verwendet Change-Detection auf Container-Dimensionen statt blindes Neuzeichnen bei jedem Event.

## SysEx-Handling System

### Datenfluss

SysEx-Nachrichten (System Exclusive) können über mehrere MIDI-Messages verteilt sein und müssen gesammelt werden.

**Implementierung** in [sysex.js](../js/sysex/sysex.js):

1. **Collection:**

   - `collectSysexData(midiData)` sammelt Bytes zwischen Start-Byte (0xF0) und End-Byte (0xF7)
   - `midiBay.collectingSysEx` Flag zeigt aktiven Collection-Zustand
   - `midiBay.sysexMessage` Array sammelt alle SysEx-Bytes
   - `parseSysexData()` filtert nur valide SysEx-Bytes (< 0x80 oder 0xF0/0xF7)

2. **Visualisierung:**

   - `showSysexTable()` zeigt gesammelte SysEx-Daten in 10-Byte Zeilen
   - `formatMessageToHtmlAndCollectSysex()` aus [htmlMessageFormat.js](../js/html/htmlMessageFormat.js) erkennt SysEx und triggert Collection
   - Monitor zeigt "SysEx Data (incomplete, collecting...)" während Collection läuft

3. **Export/Import:**
   - `autoSaveSysex` Flag für automatischen Download nach Empfang
   - `sendCollectedSysexToSysexForm()` triggert Download bei Bedarf
   - Hex-Darstellung via `hexStringFromIntArray()` und `toHex()`

**SysEx-Byte-Ranges:**

- `0x80-0xEF`: Channel Messages (Datenbytes: 0x00-0x7F)
- `0xF0`: SysEx Start → Collection beginnt
- `0xF7`: SysEx End → Collection endet
- `< 0x80`: Datenbytes innerhalb SysEx

## Drag-and-Drop Routing

### Event-Handling

Routing-Verbindungen können via Drag-and-Drop von Input- zu Output-Ports erstellt werden.

**Implementierung** in [routingDragAndDrop.js](../js/routing/routingDragAndDrop.js):

1. **Event-Pipeline:**

   - `routingEventStart(event)` bei `pointerdown` auf Input-Port
   - `routingEventMove(event)` zeichnet temporäre Drag-Line während Bewegung
   - `routingEventEnd(event)` erstellt Routing wenn auf Output-Port geendet

2. **Visual Feedback:**

   - `initializeDragLineIfNeeded()` aus [dragLineUtils.js](../js/routing/dragLineUtils.js) erstellt temporäre SVG-Linie
   - `calculateDragLinePosition()` berechnet Endpunkt basierend auf Mausposition
   - CSS-Klassen `routing_source` und `routing_target` für visuelles Feedback

3. **Completion:**
   - `togglePortRouting()` aus [routingPorts.js](../js/routing/routingPorts.js) erstellt/entfernt Verbindung
   - Drag-Line wird nach Event entfernt
   - Permanente Routing-Linien werden via `drawAllRoutingLines()` neu gezeichnet

**Event-Utilities:**

- `getEventCoordinates()` aus [dragEventUtils.js](../js/routing/dragEventUtils.js) normalisiert Touch/Mouse-Events
- `preventSelect()` aus [dragSelectUtils.js](../js/routing/dragSelectUtils.js) verhindert Text-Selection während Drag

**Guards:**

- Prüft `routingLinesUnvisible()` für Sichtbarkeit
- Prüft `midiBay.graphTag.classList.contains('routing')` für aktiven Routing-Modus
- Nur `event.isPrimary` Events werden verarbeitet (Multi-Touch-Protection)

## Test-Hinweise

Browser muss Web MIDI API unterstützen. Teste Routing mit virtuellen MIDI-Ports (z.B. IAC Driver auf macOS, loopMIDI auf Windows).

**Spezielle Test-Szenarien:**

- **Multiple Clock Sources:** Verbinde mehrere Inputs mit Clock-Signal zu einem Output → Warning sollte erscheinen
- **MIDI Loop:** Erstelle zirkuläres Routing → Loop-Detection sollte doppelte Nachrichten erkennen
- **SysEx:** Sende lange SysEx-Messages → sollten korrekt gesammelt und angezeigt werden
- **Drag-and-Drop:** Teste Routing-Erstellung via Drag auf verschiedenen Bildschirmgrößen
