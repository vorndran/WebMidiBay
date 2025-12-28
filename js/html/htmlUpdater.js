export { updateLayout, scheduleLayoutUpdate };
import { midiBay } from '../main.js';
import { logger, DEVELOPER_MODE } from '../utils/logger.js';
import { redrawRoutingLines } from '../routing/routingLines.js';
import { updateWindowSizeDisplay } from '../utils/dev/devHelpers.js';
import { updateVisibleMessages } from '../message/messageMonitor.js';

// Debounce-State für updateLayout
let layoutUpdateScheduled = false;
let layoutForceUpdate = false;

// #############################################################
/**
 * Verzögertes Layout-Update mit doppeltem Update-Zyklus.
 * Zweifaches Update: Sofort + nach kurzer Verzögerung für Scrollbar-Änderungen.
 * Wird bei Clicks und erfolgreichen Keyboard-Shortcuts aufgerufen.
 */
function scheduleLayoutUpdate() {
  // Erstes Update: Sofort nach Event
  requestAnimationFrame(() => updateLayout(true));

  // Zweites Update: Nach Scrollbar-Änderung (Browser braucht Zeit)
  setTimeout(() => {
    requestAnimationFrame(() => updateLayout(true));
  }, 50);
}

// #############################################################
/**
 * Aktualisiert alle layout-abhängigen UI-Elemente nach Größenänderungen.
 * Zentrale Funktion für komplette Layout-Updates.
 * Integriertes Debouncing: Maximal 1x pro Frame, sammelt forceUpdate-Flags.
 */
function updateLayout(forceUpdate = false) {
  // forceUpdate merken falls einer der Aufrufe es anfordert
  if (forceUpdate) layoutForceUpdate = true;

  // Bereits geplant? → Nur Flag setzen, kein neuer Frame
  if (layoutUpdateScheduled) return;
  layoutUpdateScheduled = true;

  requestAnimationFrame(() => {
    executeLayoutUpdate(layoutForceUpdate);
    layoutUpdateScheduled = false;
    layoutForceUpdate = false;
  });
}

/**
 * Führt das eigentliche Layout-Update durch.
 */
function executeLayoutUpdate(forceUpdate) {
  logger.debug('%cupdateLayout', 'color: blue; font-weight: bold;');
  if (DEVELOPER_MODE) updateWindowSizeDisplay('p.size');

  if (!midiBay.menuItemVisibleMap) return;
  // Message-Container Zeilenzahl aktualisieren
  if (midiBay.menuItemVisibleMap.get('monitor') == 'visible') {
    updateVisibleMessages(forceUpdate);
  }
  // Routing-Linien nur aktualisieren, wenn sichtbar
  if (
    midiBay.menuItemVisibleMap.get('routing') === 'visible' &&
    getComputedStyle(midiBay.graphTag).display === 'block'
  ) {
    redrawRoutingLines(forceUpdate);
  }
}
