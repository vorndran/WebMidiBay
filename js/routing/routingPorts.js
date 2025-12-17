export { toggleRouting, initRouting, resetAllRouting, togglePortRouting, resetRoutingSets };

import { midiBay } from '../main.js';
import { getPortProperties, forEachPortWithPortProperties } from '../utils/helpers.js';
import { getStorage, setStorage } from '../storage/storage.js';
import { logger } from '../utils/logger.js';
import { clearNode } from '../html/domContent.js';
import { preventAndStop } from '../html/domStyles.js';
import { initRoutingLines, drawAllRoutingLines } from './routingLines.js';
import { initDragAndDrop } from './routingDragAndDrop.js';
import { restoreSelectedPort } from './routingSelectedPort.js';
import { setInportRoutingClass, setOutportRoutingClass } from './routingCssClasses.js';

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
// ################################################################
/**
 * Speichert die aktuelle Routing-Konfiguration im localStorage.
 * Verwendet Port-Namen statt direkter Port-Referenzen für die Persistenz.
 *
 * Format:
 * {
 *   "Input Port Name": ["Output Port Name 1", "Output Port Name 2", ...]
 * }
 *
 * @see restoreRoutingOutPortName für das Laden der gespeicherten Konfiguration
 */
function storeRoutingOutPortName() {
  logger.debug('storeRoutingOutPortName');

  const serializedData = {};
  forEachPortWithPortProperties(midiBay.inNameMap, (inPort, portProperties, name) => {
    serializedData[name] = [...portProperties.outPortNameSet];
  });

  setStorage('WMB_routing_outport_name', serializedData);
}
// ################################################################
function restoreRoutingOutPortName() {
  logger.debug('restoreRoutingOutPortName');

  const serializedData = getStorage('WMB_routing_outport_name') || {};

  forEachPortWithPortProperties(midiBay.inNameMap, (inPort, portProperties, name) => {
    if (serializedData[name]) {
      portProperties.outPortNameSet = new Set(serializedData[name]);
    }
  });
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

  forEachPortWithPortProperties(midiBay.outNameMap, (outPort, portProperties) => {
    portProperties.inPortSet = new Set();
    populateInPortSetFromOutPorts(portProperties, outPort);
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
  clearNode('svg');
  storeRoutingOutPortName();
}
// #############################################################
// Toggle Port Routing - Enables/disables routing between input and output ports
// ###############################################################
function togglePortRouting(inPort, outPort) {
  const inMeta = getPortProperties(inPort);
  const outMeta = getPortProperties(outPort);
  logger.debug('togglePortRouting', inMeta.tagId, outMeta.tagId);

  midiBay.toggleRouting(inPort, outPort);
  storeRoutingOutPortName();
  setInportRoutingClass();
  setOutportRoutingClass();
}
// #############################################################
// Assign MIDI Port Functions
// ###############################################################
function assignMidiPortFunctions() {
  midiBay.selectedPort = null;
  midiBay.toggleRouting = toggleRouting;
  midiBay.isRouting = isRouting;
  midiBay.resetRoutingSets = resetRoutingSets;
  midiBay.resetRoutingSets();
}
// #############################################################
/**
 * Verwaltet die Routing-Verbindungen zwischen MIDI-Ports.
 * Teil der öffentlichen API, wird von main.js als midiBay.toggleRouting verwendet.
 *
 * @param {MIDIInput} inPort - Der Eingangs-Port
 * @param {MIDIOutput} outPort - Der Ausgangs-Port
 *
 * Die Funktion:
 * 1. Toggled die Verbindung (an/aus)
 * 2. Aktualisiert sowohl Live-Routing (outPortSet) als auch Persistenz (outPortNameSet)
 * 3. Triggert UI-Update über drawAllRoutingLines
 */
function toggleRouting(inPort, outPort) {
  const inPortProbs = getPortProperties(inPort);
  const outPortProbs = getPortProperties(outPort);
  logger.debug('toggleRouting', inPortProbs.tagId);

  if (inPortProbs.outPortSet.has(outPort)) {
    inPortProbs.outPortSet.delete(outPort);
    inPortProbs.outPortNameSet.delete(outPort.name);
    // Symmetric: Remove input port from output port inPortSet
    if (outPortProbs.inPortSet) {
      outPortProbs.inPortSet.delete(inPort);
    }
    // Remove input port from activeClockSourceSet for immediate warning update
    if (outPortProbs.activeClockSourceSet) {
      outPortProbs.activeClockSourceSet.delete(inPort);
    }
  } else {
    inPortProbs.outPortSet.add(outPort);
    inPortProbs.outPortNameSet.add(outPort.name);
    // Symmetric: Add input port to output port inPortSet
    if (!outPortProbs.inPortSet) {
      outPortProbs.inPortSet = new Set();
    }
    outPortProbs.inPortSet.add(inPort);
  }
  drawAllRoutingLines();
}
// ##################################################
function resetRoutingSets() {
  forEachPortWithPortProperties(midiBay.inNameMap, (port, portProperties) => {
    portProperties.outPortSet = new Set();
    portProperties.outPortNameSet = new Set();
  });
}

// ##################################################
function isRouting(inPort, outPort) {
  const portProperties = getPortProperties(inPort);
  return portProperties.outPortNameSet.has(outPort.name);
}
// ##################################################
