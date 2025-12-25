/**
 * Development Helper Functions (DEV ONLY)
 *
 * Diese Datei enthält Funktionen, die während der Entwicklung nützlich sind.
 * Sie sollte nur bewusst importiert werden; vor Release prüfen, ob sie benötigt wird.
 */

import { hasClass } from '../../html/domUtils.js';

// ============================================================================
// UI DEBUGGING - Layout & Window Information
// ============================================================================

/**
 * Aktualisiert die Anzeige der Fenstergröße in Pixel und rem
 * @param {string} selector - CSS-Selektor für das Anzeige-Element (z.B. 'p.size')
 */
export const updateWindowSizeDisplay = (selector = 'p.size') => {
  const width = window.outerWidth;
  const height = window.outerHeight;

  // REM-Werte basierend auf der Root-Schriftgröße berechnen
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const widthRem = (width / rootFontSize).toFixed(1);
  const heightRem = (height / rootFontSize).toFixed(1);

  const sizeText = `${width} x ${height} px (${widthRem} x ${heightRem} rem)`;

  // Importiert setText dynamisch, um zirkuläre Abhängigkeiten zu vermeiden
  import('../../html/domContent.js').then(({ setText }) => {
    setText(selector, sizeText);
  });
};

// ============================================================================
// EVENT-HANDLER - Alternative Implementierungen
// ============================================================================

export function clickMenuAlternative(eClick) {
  const classListArray = [...eClick.target.parentElement.classList];
  switch (true) {
    case classListArray.includes('filter_menu'):
      console.log(`click`, eClick.target.parentElement);
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

// ============================================================================
// HTMLPORTS.JS - Debugging Guards
// ============================================================================

export function debugClickedMidiPortGuards(eClick, midiBay) {
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
  if (!hasClass(eClick.target, 'midiport')) {
    console.log('DEBUG: target is not midiport, blocking click');
    return;
  }
}

export function showPortsInnerHTMLMethod(midiMap, inOrOut) {
  const pTag = document.querySelector(`#${inOrOut}puts p`);
  let pTagInnerHTML = '';
  console.log('Using innerHTML method for ports:', pTagInnerHTML, midiMap);
}

// ============================================================================
// HTMLSYSEX.JS - Alternative Implementierungen
// ============================================================================

export function showSoundsAlternative(soundCategories) {
  const pSnd = document.querySelector('#sounds');
  if (pSnd) {
    const soundHead = `<span>${soundCategories.join('</span><span>')}</span><br>`;
    console.log('Sound categories:', soundHead);
  }
}

// ============================================================================
// HTMLALIAS.JS - Event-Dispatching Alternativen
// ============================================================================

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

export function getStatusByteOld(midiData) {
  console.log('get StatusByte');
  const statusByte = midiData < 240 ? midiData - (midiData % 16) : midiData;
  return statusByte;
}

export function filteredMidiInDataOld(statusByte, inPort, midiBay) {
  console.log('filtered Midi In Data', statusByte, inPort.filterSet);

  if (midiBay.globalFilterSet.has(statusByte.toString())) return true;
  if (inPort.filterSet.has(statusByte.toString())) return true;

  return false;
}

export function filteredMidiOutDataOld(statusByte, outPortName, midiBay) {
  console.log('filtered Midi Out Data');

  if (midiBay.outNameMap.get(outPortName).filterSet.has(statusByte.toString())) return true;
  return false;
}

// ============================================================================
// ROUTINGDRAGANDDROP.JS - Touch/Mouse Event Alternativen
// ============================================================================

export function getHoveredTagFromTouch(event) {
  const hoveredTag = document.elementFromPoint(
    event.changedTouches[0].pageX - window.scrollX,
    event.changedTouches[0].pageY - window.scrollY
  );
  console.log('DEBUG: Hovered tag from touch:', hoveredTag);
  return hoveredTag;
}

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

export function logEventListeners(element) {
  console.log('Event listeners for:', element);
  if (typeof getEventListeners === 'function') {
    console.table(getEventListeners(element));
  }
}

export function logMidiPortFlags(midiBay) {
  console.log('=== MIDI Port Flags ===');
  console.log('renamePortsFlag:', midiBay.renamePortsFlag);
  console.log('routingEvent:', midiBay.routingEvent);
  console.log('editPortTag:', midiBay.editPortTag);
  console.log('graphTag.dragLine:', midiBay.graphTag?.dragLine);
}

export function logClassList(element, label = 'Element') {
  console.log(`${label} classList:`, [...element.classList]);
}
