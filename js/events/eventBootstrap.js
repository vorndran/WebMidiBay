/**
 * Event Listener Setup (Bootstrap)
 * Delegiert die Handler-Logik an menuHandlers und portHandlers.
 */

export { setEventListener };

import { clickEvents, changeEvents } from './clickMap.js';
import { handleKeyboardShortcuts } from './keyboardShortcuts.js';
import { renamePortAlias } from '../ports/portAlias.js';
import { updateLayout, scheduleLayoutUpdate } from '../html/htmlUpdater.js';
import { midiBay } from '../main.js';

function setEventListener() {
  registerEventListeners('click', clickEvents);
  registerEventListeners('dblclick', { 'li.midiport': renamePortAlias });

  registerChangeListeners();
  registerKeyboardListeners();

  // Layout-Updates bei Fenstergrößenänderung
  window.addEventListener('resize', updateLayout);

  // Doppeltes Layout-Update nach UI-Events für Scrollbar-Timing
  initDelayedLayoutUpdates();

  // ResizeObserver als Fallback für Container-Größenänderungen
  initResizeObserver();
}

/**
 * Verzögerte Layout-Updates nach UI-Events.
 */
function initDelayedLayoutUpdates() {
  document.addEventListener('click', handleClickForLayoutUpdate, false);
  document.addEventListener('change', scheduleLayoutUpdate, false);
  // Note: keydown scheduleLayoutUpdate nur bei erfolgreichen Shortcuts (siehe keyboardShortcuts.js)
}

/**
 * Click-Handler für Layout-Updates mit contentEditable-Check.
 * Lässt Clicks auf contentEditable Elemente durch für Cursor-Positionierung.
 */
function handleClickForLayoutUpdate(event) {
  // Ignore clicks on contentEditable elements (z.B. Port-Umbenennung)
  const target = event.target;
  if (target && (target.contentEditable === 'true' || target.isContentEditable)) {
    return;
  }
  scheduleLayoutUpdate();
}

/**
 * Initialisiert ResizeObserver auf dem Haupt-Container.
 * Wird automatisch getriggert wenn sich die Größe ändert (z.B. Scrollbar).
 */
function initResizeObserver() {
  const container = document.querySelector('.container');
  if (!container) return;

  // Throttle: Maximal 1x pro Frame updaten
  let resizeScheduled = false;

  const resizeObserver = new ResizeObserver(() => {
    if (resizeScheduled) return;
    resizeScheduled = true;

    requestAnimationFrame(() => {
      updateLayout(true);
      resizeScheduled = false;
    });
  });

  resizeObserver.observe(container);
  midiBay.resizeObserver = resizeObserver; // Für Cleanup/Debugging
}

function registerEventListeners(event, events) {
  for (const [selector, func] of Object.entries(events)) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(event, func, { passive: false });
    });
  }
}

function registerChangeListeners() {
  registerEventListeners('change', changeEvents);
}

function registerKeyboardListeners() {
  document.addEventListener('keydown', handleKeyboardShortcuts);
}
