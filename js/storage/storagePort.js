/**
 * Port-Specific Storage Functions
 *
 * Storage-Operationen für MIDI-Ports mit PortProperties-Handling.
 * Konvertiert zwischen Port-Maps und Storage-Format (Sets ↔ Arrays).
 */

export { storePortMap, restorePortMap, removeSelectedPortStorage };

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
