export { updateLayout };
import { midiBay } from '../main.js';

/**
 * HTML Updater
 *
 * Zentrale Funktionen für Layout- und UI-Updates.
 * Koordiniert verschiedene Update-Mechanismen nach Größenänderungen oder Layout-Events.
 */
import { logger } from '../utils/logger.js';
import { redrawRoutingLines } from '../routing/routingLinesSvg.js';
import { updateWindowSizeDisplay } from '../utils/helpers.js';
import { updateVisibleMessages } from './htmlMessage.js';
import { hasClass } from './domClasses.js';
// #############################################################
/**
 * Aktualisiert alle layout-abhängigen UI-Elemente nach Größenänderungen.
 * Zentrale Funktion für komplette Layout-Updates.
 */
function updateLayout(forceUpdate = false) {
  // logger.debug('%cupdateLayout', 'color: blue; font-weight: bold;');

  // Fenstergröße anzeigen
  updateWindowSizeDisplay('p.size');

  if (!midiBay.menuItemVisibleMap) return;
  // Message-Container Zeilenzahl aktualisieren
  if (midiBay.menuItemVisibleMap.get('monitor') == 'visible') {
    // logger.debug('%cupdateVisibleMessages from updateLayout', 'color: purple; font-weight: bold;');
    updateVisibleMessages(forceUpdate);
  }
  // logger.debug(
  //   '%c Routing Lines Check',
  //   'color: blue; font-weight: bold;',
  //   midiBay.menuItemVisibleMap.get('routing'),
  //   getComputedStyle(midiBay.graphTag).display
  // );
  // Routing-Linien nur aktualisieren, wenn sichtbar
  if (
    // midiBay.graphTag &&
    midiBay.menuItemVisibleMap.get('routing') == 'visible' &&
    getComputedStyle(midiBay.graphTag).display === 'block'
  ) {
    // SVG Routing-Linien neu zeichnen
    // logger.debug('%credrawRoutingLines from updateLayout', 'color: blue; font-weight: bold;');
    redrawRoutingLines(forceUpdate);
  }
}
