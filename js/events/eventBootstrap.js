/**
 * Event Listener Setup (Bootstrap)
 * Delegiert die Handler-Logik an menuHandlers und portHandlers.
 */

export { setEventListener };

import { clickEvents, changeEvents } from './clickMap.js';
import { handleKeyboardShortcuts } from './keyboardShortcuts.js';
import { renamePortAlias } from '../ports/portAlias.js';
import { updateLayout } from '../html/htmlUpdater.js';
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
 * Zweifaches Update: Sofort + nach kurzer Verzögerung für Scrollbar-Änderungen.
 */
function initDelayedLayoutUpdates() {
  const scheduleLayoutUpdate = () => {
    // Erstes Update: Sofort nach Event
    requestAnimationFrame(() => updateLayout(true));

    // Zweites Update: Nach Scrollbar-Änderung (Browser braucht Zeit)
    setTimeout(() => {
      requestAnimationFrame(() => updateLayout(true));
    }, 50);
  };

  document.addEventListener('click', scheduleLayoutUpdate, false);
  document.addEventListener('keydown', scheduleLayoutUpdate, false);
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
