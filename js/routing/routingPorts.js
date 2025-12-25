export { initRouting, resetAllRouting };

import { midiBay } from '../main.js';
import { getPortProperties, forEachPortWithPortProperties } from '../utils/helpers.js';
import { setStorage } from '../storage/storage.js';
import { storeRoutingOutPortName, restoreRoutingOutPortName } from '../storage/storagePort.js';
import { logger } from '../utils/logger.js';
import { clearInnerHTML } from '../html/domContent.js';
import { preventAndStop } from '../html/domUtils.js';
import { initRoutingLines } from './routingLines.js';
import { initDragAndDrop } from './routingDragAndDrop.js';
import { restoreSelectedPort } from '../ports/portSelection.js';
import {
  setInportRoutingClass,
  setOutportRoutingClass,
  removeAllRoutedClasses,
} from './routingCssClasses.js';
import { toggleRouting } from './routingToggleRouting.js';

// ###################################################
function initRouting() {
  assignMidiPortFunctions();
  restoreRoutingOutPortName();
  resetOutPortSet();
  resetInPortSet();
  restoreSelectedPort();
  setInportRoutingClass();
  setOutportRoutingClass();
  initRoutingLines();
  initDragAndDrop();
}
// ###################################################
/**
 * Synchronisiert die Live-Port-Sets mit den gespeicherten Port-Namen.
 * Wandelt Port-Namen in Port-Referenzen um.
 */
function resetOutPortSet() {
  logger.debug('resetOutPortSet');

  forEachPortWithPortProperties(midiBay.inNameMap, (inPort, portProperties) => {
    portProperties.outPortSet = new Set();
    populateOutPortSetFromNames(portProperties);
  });
}
// ###################################################
/**
 * Füllt das outPortSet mit Port-Referenzen basierend auf gespeicherten Namen.
 * @param {Object} portProperties - Die Metadaten des Input-Ports
 */
function populateOutPortSetFromNames(portProperties) {
  portProperties.outPortNameSet.forEach((outPortName) => {
    const outPort = midiBay.outNameMap.get(outPortName);
    if (outPort) {
      portProperties.outPortSet.add(outPort);
    }
  });
}
// ###################################################
/**
 * Synchronisiert die inPort-Sets für Output-Ports (symmetrisch zu resetOutPortSet).
 * Wandelt Routing-Informationen in umgekehrte Referenzen um.
 */
function resetInPortSet() {
  logger.debug('resetInPortSet');

  forEachPortWithPortProperties(midiBay.outNameMap, (outPort, outPortProperties) => {
    outPortProperties.inPortSet = new Set();
    populateInPortSetFromOutPorts(outPortProperties, outPort);
  });
}
// ###################################################
/**
 * Füllt das inPortSet mit Port-Referenzen basierend auf Routing-Informationen.
 * Symmetrisch zu populateOutPortSetFromNames.
 * @param {Object} outPortProperties - Die Metadaten des Output-Ports
 * @param {MIDIOutput} outPort - Der Output-Port selbst
 */
function populateInPortSetFromOutPorts(outPortProperties, outPort) {
  forEachPortWithPortProperties(midiBay.inNameMap, (inPort, inPortProperties) => {
    if (inPortProperties.outPortSet.has(outPort)) {
      outPortProperties.inPortSet.add(inPort);
    }
  });
}

// ###########################################
function resetAllRouting(eClick) {
  logger.debug('resetAllRouting');
  preventAndStop(eClick);

  midiBay.resetRoutingSets();
  clearInnerHTML('svg');
  removeAllRoutedClasses();
  storeRoutingOutPortName();
}
// #############################################################
// Assign MIDI Port Functions
// ###############################################################
function assignMidiPortFunctions() {
  midiBay.selectedPort = null;
  midiBay.resetRoutingSets = resetRoutingSets;
  midiBay.resetRoutingSets();
  midiBay.isRouting = isRouting;
  midiBay.toggleRouting = toggleRouting;
}
// ##################################################
function resetRoutingSets() {
  forEachPortWithPortProperties(midiBay.inNameMap, (port, portProperties) => {
    portProperties.outPortSet = new Set();
    portProperties.outPortNameSet = new Set();
  });
  forEachPortWithPortProperties(midiBay.outNameMap, (port, portProperties) => {
    portProperties.inPortSet = new Set();
  });
}

// ##################################################
function isRouting(inPort, outPort) {
  const portProperties = getPortProperties(inPort);
  return portProperties.outPortNameSet.has(outPort.name);
}
// ##################################################
