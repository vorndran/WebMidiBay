export { addSelectedPort, removeSelectedPort, restoreSelectedPort };

import { midiBay } from '../main.js';
import { getPortProperties, getPortByTagId } from '../utils/helpers.js';
import { getStorage, setStorage } from '../storage/storage.js';
import { removeSelectedPortStorage } from '../storage/storagePort.js';
import { addClass, removeClass } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import { setOutportRoutingClass } from '../routing/routingCssClasses.js';
import { updateLayout } from '../html/htmlUpdater.js';

// ###################################################
/**
 * Stellt die gespeicherte Port-Auswahl aus dem localStorage wieder her.
 */
function restoreSelectedPort() {
  logger.debug('restoreSelectedPort');

  const tagId = getStorage('WMB_selected_port');
  if (!tagId) return;

  const selectedPortTag = findSelectedPortTag(tagId);
  if (!selectedPortTag) return;

  applyStoredPortSelection(selectedPortTag, tagId);
}
// ###################################################
/**
 * Sucht das HTML-Element für die gespeicherte Tag-ID.
 * Entfernt ungültige Einträge aus dem Storage.
 * @param {string} tagId - Die ID des gesuchten Port-Tags
 * @returns {HTMLElement|null} Das gefundene Element oder null
 */
function findSelectedPortTag(tagId) {
  const selectedPortTag = document.getElementById(tagId);

  if (!selectedPortTag) {
    removeSelectedPortStorage();
  }

  return selectedPortTag;
}
// ###################################################
/**
 * Wendet die gespeicherte Auswahl auf das Port-Tag an.
 * @param {HTMLElement} selectedPortTag - Das HTML-Element des Ports
 * @param {string} tagId - Die Tag-ID des Ports
 */
function applyStoredPortSelection(selectedPortTag, tagId) {
  addClass(selectedPortTag, 'selected_port');
  midiBay.selectedPort = getPortByTagId(tagId);
}
// ####################################################
function addSelectedPort(clickedPort) {
  setSelectedPort(clickedPort);
  setOutportRoutingClass();
}
// ####################################################
/**
 * Markiert einen Port als ausgewählt und aktualisiert die UI.
 * @param {MIDIPort} clickedPort - Der zu selektierende Port
 */
function setSelectedPort(clickedPort) {
  logger.debug('setSelectedPort');

  const previousPort = midiBay.selectedPort;

  if (previousPort === clickedPort) {
    deselectPort(clickedPort);
    return;
  }

  updateSelectedPortState(clickedPort);

  if (previousPort) {
    removePreviousPortSelection(previousPort);
  }
}
// ####################################################
/**
 * Entfernt die Auswahl eines Ports.
 * @param {MIDIPort} port - Der zu deselektierende Port
 */
function deselectPort(port) {
  const portProperties = getPortProperties(port);
  removeSelectedPort(portProperties.tag);
}
// ####################################################
/**
 * Aktualisiert den globalen Selected-Port-Status und die UI.
 * @param {MIDIPort} port - Der neue selektierte Port
 */
function updateSelectedPortState(port) {
  midiBay.selectedPort = port;
  const portProperties = getPortProperties(port);
  addClass(portProperties.tag, 'selected_port');
  setStorage('WMB_selected_port', portProperties.tagId);
}
// ####################################################
/**
 * Entfernt die visuelle Markierung vom zuvor selektierten Port.
 * @param {MIDIPort} previousPort - Der zuvor selektierte Port
 */
function removePreviousPortSelection(previousPort) {
  const prevMeta = getPortProperties(previousPort);
  // prevMeta.tag ist garantiert vorhanden (wird bei Initialisierung erstellt)
  removeClass(prevMeta.tag, 'selected_port');
}
// ####################################################
function removeSelectedPort(selectedPortTag) {
  logger.debug('removeSelectedPort');
  if (midiBay.selectedPort) {
    const selMeta = getPortProperties(midiBay.selectedPort);
    if (selMeta.tag == selectedPortTag) midiBay.selectedPort = null;
  }
  removeSelectedPortStorage();
  removeClass(selectedPortTag, 'selected_port');
  setOutportRoutingClass();
}
