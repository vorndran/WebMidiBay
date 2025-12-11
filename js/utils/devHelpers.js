/**
 * Development Helper Functions
 *
 * Diese Datei enthält auskommentierte Funktionen aus verschiedenen Modulen,
 * die während der Entwicklung und zum Debugging nützlich sein können.
 *
 * VERWENDUNG:
 * -----------
 * Import einzelner Funktionen in Entwicklungsdateien:
 *   import { functionName } from '../utils/devHelpers.js';
 *
 * WICHTIG:
 * --------
 * - Diese Funktionen sind NICHT Teil des Produktionscodes
 * - Imports nur während der Entwicklung nutzen
 * - Vor Produktionsrelease alle Imports aus devHelpers.js entfernen
 *
 * KATEGORIEN:
 * -----------
 * - HTML Events: Alternative Event-Handler-Implementierungen
 * - HTML Ports: Debugging-Guards und alternative Rendering-Methoden
 * - Filter Data: Alte/alternative Filter-Implementierungen
 * - Routing: Touch/Mouse Event-Alternativen
 * - Utilities: Generische Debug-Helfer
 */

// ============================================================================
// HTMLEVENTS.JS - Alternative Event-Handler-Implementierungen
// ============================================================================

/**
 * Alternative clickMenu-Implementierung mit Switch-Statement
 * Original-Kontext: htmlEvents.js, Zeile 100-117
 * Funktion: Menu-Items basierend auf classList toggle
 */
export function clickMenuAlternative(eClick) {
  const classListArray = [...eClick.target.parentElement.classList];
  switch (true) {
    case classListArray.includes('filter_menu'):
      console.log(`click`, eClick.target.parentElement);
      // toggleVisibleMenuItem logic hier
      break;
    case classListArray.includes('settings_menu'):
      console.log(`click`, eClick.target.parentElement);
      break;
    case classListArray.includes('monitor_menu'):
      console.log(`click`, eClick.target.parentElement);
      break;
    case classListArray.includes('sysex_menu'):
      console.log(`click`, eClick.target.parentElement);
      break;
  }
}

/**
 * Auskommentierte Event-Handler-Optionen
 * Original-Kontext: htmlEvents.js, setEventListener()
 */
export const alternativeClickEvents = {
  // Globale Window-Events (auskommentiert wegen Konflikten)
  // window_disableRouting: () => window.addEventListener('click', disableRouting),
  // window_unselectPort: () => window.addEventListener('click', unselectSelectedPort),
  // Alternative Event-Targets
  // '#inputs_head': resetAllRouting,
  // '#filter_head': resetAllFilter,
  // '.filterportinfo': clickedUnselectSelectedPort,
  // '#routing': clickedPortMenuRouting,
  // '#message_filter': clickedPortMenuRouting,
  // '#graph': clickedPortMenuRouting,
  // '#form_settings ul > li': clearStorage,
};

// ============================================================================
// HTML.JS - Alternative Implementierungen
// ============================================================================

/**
 * Alternative showMidiAccessStateChange Signatur
 * Original-Kontext: html.js, Zeile 63
 * Funktion: Zeigt MIDI-Port State Changes mit separaten Parametern
 */
export function showMidiAccessStateChangeOld(porttype, portname, status) {
  console.log('MidiAccessStateChange (old signature)', porttype, portname, status);
  // Implementation hier
}

// ============================================================================
// HTMLPORTS.JS - Debugging Guards
// ============================================================================

/**
 * Debugging-Guards für clickedMidiPort
 * Original-Kontext: htmlPorts.js, Zeile 45-49
 * Funktion: Early returns für verschiedene Editing-Modi
 */
export function debugClickedMidiPortGuards(eClick) {
  if (midiBay.renamePortsFlag) {
    console.log('DEBUG: renamePortsFlag active, blocking click');
    return;
  }
  if (midiBay.routingEvent) {
    console.log('DEBUG: routingEvent active, blocking click');
    return;
  }
  if (midiBay.editPortTag) {
    console.log('DEBUG: editPortTag active, blocking click');
    return;
  }
  if (!eClick.target.classList.contains('midiport')) {
    console.log('DEBUG: target is not midiport, blocking click');
    return;
  }
}

/**
 * Alternative innerHTML-basierte Port-Anzeige
 * Original-Kontext: htmlPorts.js, mehrere appendPortTagsToRoutingLists() Kommentare
 */
export function showPortsInnerHTMLMethod(midiMap, inOrOut) {
  const pTag = document.querySelector(`#${inOrOut}puts p`);
  let pTagInnerHTML = '';
  // Implementation hier
  console.log('Using innerHTML method for ports:', pTagInnerHTML);
}

// ============================================================================
// HTMLSYSEX.JS - Alternative Implementierungen
// ============================================================================

/**
 * Alternative Sysex Sound-Display
 * Original-Kontext: htmlSysex.js, Zeile 20-22
 */
export function showSoundsAlternative(soundCategories) {
  let pSnd = document.querySelector('#sounds');
  if (pSnd) {
    let soundHead = `<span>${soundCategories.join('</span><span>')}</span><br>`;
    console.log('Sound categories:', soundHead);
  }
}

// ============================================================================
// HTMLALIAS.JS - Event-Dispatching Alternativen
// ============================================================================

/**
 * Alternative Event-Erstellung
 * Original-Kontext: htmlAlias.js, Zeile 90, 103
 */
export function createEditPortEvent(editPortTag) {
  const sendEvent = new Object({ target: editPortTag });
  console.log('Created edit port event:', sendEvent);
  return sendEvent;
}

export function shouldBlockAliasEdit(eClick, editPortTag) {
  if (eClick.target == editPortTag) {
    console.log('DEBUG: Click target matches editPortTag, blocking');
    return true;
  }
  return false;
}

// ============================================================================
// FILTERDATA.JS - Alte Filter-Funktionen
// ============================================================================

/**
 * Alte getStatusByte-Implementierung
 * Original-Kontext: filterData.js, Zeile 5-10
 * HINWEIS: Diese Funktion wurde nach midiMessageFilter.js verschoben
 */
export function getStatusByteOld(midiData) {
  console.log('get StatusByte');
  const statusByte = midiData < 240 ? midiData - (midiData % 16) : midiData;
  return statusByte;
}

/**
 * Alte filteredMidiInData-Implementierung
 * Original-Kontext: filterData.js, Zeile 12-19
 */
export function filteredMidiInDataOld(statusByte, inPort) {
  console.log('filtered Midi In Data', statusByte, inPort.filterSet);

  if (midiBay.globalFilterSet.has(statusByte.toString())) return true;
  if (inPort.filterSet.has(statusByte.toString())) return true;

  return false;
}

/**
 * Alte filteredMidiOutData-Implementierung
 * Original-Kontext: filterData.js, Zeile 21-27
 */
export function filteredMidiOutDataOld(statusByte, outPortName) {
  console.log('filtered Midi Out Data');

  if (midiBay.outNameMap.get(outPortName).filterSet.has(statusByte.toString())) return true;
  return false;
}

// ============================================================================
// ROUTINGDRAGANDDROP.JS - Touch/Mouse Event Alternativen
// ============================================================================

/**
 * Alternative Touch-Position-Berechnung
 * Original-Kontext: routingDragAndDrop.js, Zeile 53
 */
export function getHoveredTagFromTouch(event) {
  const hoveredTag = document.elementFromPoint(
    event.changedTouches[0].pageX - window.scrollX,
    event.changedTouches[0].pageY - window.scrollY
  );
  console.log('DEBUG: Hovered tag from touch:', hoveredTag);
  return hoveredTag;
}

/**
 * Auskommentierte Case-Statements für Event-Handler
 * Original-Kontext: routingDragAndDrop.js, verschiedene Zeilen
 */
export const alternativeDragEventCases = {
  mousedown: (event) => {
    console.log('DEBUG: mousedown alternative handler');
  },
  touchstart: (event) => {
    if (event.touches.length > 1) {
      console.log('DEBUG: Multi-touch detected, returning');
      return;
    }
  },
  mouseup: (event) => {
    console.log('DEBUG: mouseup alternative handler');
    // Alternative: dispatch click if no drag occurred
    // if (!midiBay.graphTag.dragLine)
    //   event.target.dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
  },
  touchcancel: (event) => {
    console.log('DEBUG: touchcancel handler');
    return;
  },
  mousemove_or_mouseup: (event) => {
    console.log('DEBUG: Combined mousemove/mouseup handler');
  },
};

// ============================================================================
// UTILITY FUNCTIONS - Generische Debug-Helfer
// ============================================================================

/**
 * Loggt alle Event-Listener eines Elements
 */
export function logEventListeners(element) {
  console.log('Event listeners for:', element);
  // Moderne Browser haben getEventListeners() in DevTools
  if (typeof getEventListeners === 'function') {
    console.table(getEventListeners(element));
  }
}

/**
 * Zeigt aktuelle midiBay-Status-Flags
 */
export function logMidiPortFlags(midiBay) {
  console.log('=== MIDI Port Flags ===');
  console.log('renamePortsFlag:', midiBay.renamePortsFlag);
  console.log('routingEvent:', midiBay.routingEvent);
  console.log('editPortTag:', midiBay.editPortTag);
  console.log('graphTag.dragLine:', midiBay.graphTag?.dragLine);
}

/**
 * Debug-Helper: Zeigt classList eines Elements
 */
export function logClassList(element, label = 'Element') {
  console.log(`${label} classList:`, [...element.classList]);
}
