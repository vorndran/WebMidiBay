/**
 * Port-Specific Storage Functions
 *
 * Storage-Operationen für MIDI-Ports mit PortProperties-Handling.
 * Konvertiert zwischen Port-Maps und Storage-Format (Sets ↔ Arrays).
 */

export {
  storePortMap,
  restorePortMap,
  removeSelectedPortStorage,
  storeRoutingOutPortName,
  restoreRoutingOutPortName,
};
import { midiBay } from '../main.js';
import { getStorage } from './storage.js';
/**
 * Speichert die aktuelle Routing-Konfiguration im sessionStorage.
 * Verwendet Port-Namen statt direkter Port-Referenzen für die Persistenz.
 */
function storeRoutingOutPortName() {
  logger.debug('storeRoutingOutPortName');
  const serializedData = {};
  forEachPortWithPortProperties(midiBay.inNameMap, (inPort, portProperties, name) => {
    serializedData[name] = [...portProperties.outPortNameSet];
  });
  setStorage('WMB_routing_outport_name', serializedData);
}

/**
 * Lädt die gespeicherte Routing-Konfiguration aus dem sessionStorage.
 */
function restoreRoutingOutPortName() {
  logger.debug('restoreRoutingOutPortName');
  const serializedData = getStorage('WMB_routing_outport_name') || {};
  forEachPortWithPortProperties(midiBay.inNameMap, (inPort, portProperties, name) => {
    if (serializedData[name]) {
      portProperties.outPortNameSet = new Set(serializedData[name]);
    }
  });
}

import { getPortProperties, forEachPortWithPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { setStorage } from './storage.js';

const storage = sessionStorage;

// ##################################################
function storePortMap(storageKey, portMap, itemName) {
  setStorage(storageKey, parsePortMap(portMap, itemName));
}

// ##################################################
function parsePortMap(portMap, itemName) {
  const storageObj = {};

  forEachPortWithPortProperties(portMap, (port, portProperties) => {
    const value = portProperties[itemName];

    // Serialize Sets to arrays, keep primitives as-is
    if (value && typeof value[Symbol.iterator] === 'function' && typeof value !== 'string') {
      storageObj[port.name] = [...value];
    } else {
      storageObj[port.name] = value;
    }
  });

  return storageObj;
}

// ##################################################
function restorePortMap(storageKey, portMap, itemName) {
  const storageObj = JSON.parse(storage.getItem(storageKey));
  if (!storageObj) return false;

  Object.keys(storageObj).forEach((portName) => {
    const port = portMap.get(portName);
    if (!port) return;

    const portProperties = getPortProperties(port);
    // Convert arrays back to Sets, keep primitives as-is
    portProperties[itemName] = Array.isArray(storageObj[portName])
      ? new Set(storageObj[portName])
      : storageObj[portName];
  });

  return true;
}

// ##################################################
function removeSelectedPortStorage() {
  storage.removeItem('WMB_selected_port');
}
