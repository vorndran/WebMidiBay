export { disableRouting, initRoutingLines, routingLinesUnvisible };

import { midiBay } from '../main.js';
import { getPortProperties, getSelectedPortProperties } from '../utils/helpers.js';
import { removeSelectedPort } from './routingSelectedPort.js';
import { setFilterPortInfoTagClass, setFilterContainerClass } from '../filter/filterCss.js';
import { logger } from '../utils/logger.js';
import { toggleDisplayClass } from '../html/domStyles.js';

import { setChannelClass } from '../filter/filterChannel.js';
import { unselectSelectedPort } from '../filter/filter.js';
import { preventAndStop, getComputedStyleValue } from '../html/domStyles.js';
import {
  drawRoutingLine,
  drawAllRoutingLines,
  redrawRoutingLines,
  resetGraphTagPosition,
  get_Y_CenterPosition,
  getDragLine,
} from './routingLinesSvg.js';

// Re-export SVG functions for backward compatibility
export {
  drawRoutingLine,
  drawAllRoutingLines,
  redrawRoutingLines,
  get_Y_CenterPosition,
  getDragLine,
};
// ################################################################
function initRoutingLines() {
  midiBay.lineMap = new Map();
  midiBay.graphTag = document.getElementById('graph');
  midiBay.svgContainerTag = document.querySelector('div.container');
  midiBay.svgDimension = null;
  midiBay.svgRectArray = [0, 0, 0, 0, 0, 0, 0, 0];
  // Vereinfachter Sichtbarkeitsstatus statt spezifischer Display-Werte
  midiBay.graphTag.graphDisplay = 'visible';
  redrawRoutingLines();

  // Initiale Fenstergröße anzeigen
  // import('../utils/helpers.js').then(({ updateWindowSizeDisplay }) => {
  //   updateWindowSizeDisplay('p.size');
  // });
}

// ################################################################
function disableRouting(eClick) {
  logger.debug('disableRouting');
  preventAndStop(eClick);

  midiBay.graphTag.classList.remove('routing');
  midiBay.portByTagIdMap.forEach((port) => {
    getPortProperties(port).tag.classList.remove('routing');
  });
}
// ################################################################

// ##################################################
/**
 * Aktualisiert die CSS-Klasse des Menü-Items basierend auf Routing-Status.
 * @param {HTMLElement} menuItem - Das Menü-Element
 */
function setMenuItemClass(menuItem) {
  toggleDisplayClass(menuItem, 'active', midiBay.graphTag.classList.contains('routing'));
}

// ##################################################
/**
 * Prüft, ob Routing-Linien unsichtbar sind.
 * @returns {boolean} True, wenn Routing-Container ausgeblendet ist
 */
function routingLinesUnvisible() {
  return getComputedStyleValue('#routing_lines', 'display') === 'none';
}
