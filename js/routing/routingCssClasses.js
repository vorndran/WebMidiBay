export { setInportRoutingClass, setOutportRoutingClass, removeAllRoutedClasses };

import { midiBay } from '../main.js';
import {
  getPortProperties,
  forEachPortWithPortProperties,
  getSelectedPort,
  getPortByTagId,
} from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

import { addClass, toggleClass, removeClassFromAll } from '../html/domUtils.js';

// ###################################################
function setOutportRoutingClass() {
  setRoutedOutportRoutingClass();
  setSelectRoutetOutportRoutingClass();
}
// ###################################################
/**
 * Aktualisiert die CSS-Klassen aller Output-Ports basierend auf
 * ihrer Verbindung zum ausgewählten Input-Port.
 */
function setSelectRoutetOutportRoutingClass() {
  logger.debug('setSelectRoutetOutportRoutingClass');

  clearRoutedToSelectedInputClass();

  if (!shouldHighlightRoutedOutputs()) {
    updateSelectedRoutingLines();
    return;
  }

  highlightRoutedOutputs();
  updateSelectedRoutingLines();
}
// ###################################################
/**
 * Aktualisiert die 'selected' CSS-Klasse aller Routing-Linien
 * basierend auf Verbindung zum ausgewählten Port.
 */
function updateSelectedRoutingLines() {
  logger.debug('updateSelectedRoutingLines');

  // Entferne 'selected' von allen Linien
  removeClassFromAll('.line.selected', 'selected');

  const selectedPort = getSelectedPort();
  if (!selectedPort) return;

  // Prüfe ob lineMap existiert (wird erst nach initRoutingLines erstellt)
  if (!midiBay.lineMap) return;

  const selectedProps = getPortProperties(selectedPort);
  const selectedTagId = selectedProps.tagId;

  // Durchlaufe alle Linien und prüfe Verbindung
  midiBay.lineMap.forEach((line) => {
    const lineInput = line.dataset.input;
    const lineOutput = line.dataset.output;

    // Markiere Linie wenn sie mit selectedPort verbunden ist
    if (lineInput === selectedTagId || lineOutput === selectedTagId) {
      addClass(line, 'selected');
    }
  });
}
// ###################################################
/**
 * Entfernt die CSS-Klasse von allen Output-Ports.
 */
function clearRoutedToSelectedInputClass() {
  removeClassFromAll('.routed_to_selected_input', 'routed_to_selected_input');
}
// ###################################################
/**
 * Prüft, ob Output-Ports hervorgehoben werden sollen.
 * @returns {boolean} True, wenn ein Input-Port ausgewählt ist
 */
function shouldHighlightRoutedOutputs() {
  const selectedPort = getSelectedPort();
  return selectedPort && selectedPort.type !== 'output';
}
// ###################################################
/**
 * Markiert alle Output-Ports, die mit dem ausgewählten Input-Port verbunden sind.
 */
function highlightRoutedOutputs() {
  const portProbs = getPortProperties(getSelectedPort());
  portProbs.outPortSet.forEach((outPort) => {
    addClass(getPortProperties(outPort).tag, 'routed_to_selected_input');
  });
}
// ###################################################
/**
 * Aktualisiert die CSS-Klassen aller Output-Ports basierend auf
 * ihrer Verbindung zu aktiven Input-Ports.
 */
function setRoutedOutportRoutingClass() {
  logger.debug('setRoutedOutportRoutingClass');

  // Zuerst alle alten routed_to_input Klassen entfernen
  removeClassFromAll('.routed_to_input', 'routed_to_input');

  // Dann für alle aktuell gerouteten Input-Ports die Klassen neu setzen
  const routedInPortTags = document.querySelectorAll('.routed_to_output');
  routedInPortTags.forEach((tag) => {
    markConnectedOutputPorts(tag);
  });
}
// ###################################################
/**
 * Markiert alle Output-Ports, die mit dem gegebenen Input-Port verbunden sind.
 * @param {HTMLElement} inPortTag - Das HTML-Element des Input-Ports
 */
function markConnectedOutputPorts(inPortTag) {
  const inPort = getPortByTagId(inPortTag.id);
  const portProbs = getPortProperties(inPort);

  portProbs.outPortSet.forEach((outPort) => {
    addClass(getPortProperties(outPort).tag, 'routed_to_input');
  });
}
// ###################################################
/**
 * Aktualisiert die CSS-Klassen aller Input-Ports basierend auf ihrem Routing-Status.
 * Ein Port erhält die Klasse 'routed_to_output', wenn er mindestens eine aktive
 * Verbindung zu einem Output-Port hat.
 *
 * @see setOutportRoutingClass - Gegenstück für Output-Ports
 * @see setRoutedOutportRoutingClass - Spezifische Output-Visualisierung
 */
function setInportRoutingClass() {
  logger.debug('setInportRoutingClass');
  forEachPortWithPortProperties(midiBay.inNameMap, (inport, portProbs) => {
    toggleClass(portProbs.tag, 'routed_to_output', portProbs.outPortSet.size > 0);
  });
}
// ###################################################
// Entfernt alle .routed_to_input und .routed_to_output Klassen im gesamten DOM
function removeAllRoutedClasses() {
  removeClassFromAll('.routed_to_input', 'routed_to_input');
  removeClassFromAll('.routed_to_output', 'routed_to_output');
  removeClassFromAll('.routed_to_selected_input', 'routed_to_selected_input');
}
