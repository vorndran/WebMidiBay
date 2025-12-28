export { togglePortRouting, toggleRouting, removeAllRoutingsToOutput };

import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { drawAllRoutingLines } from './routingLines.js';
import { setInportRoutingClass, setOutportRoutingClass } from './routingCssClasses.js';
import { storeRoutingOutPortName } from '../storage/storagePort.js';
import { preventCircularRouting } from './routingCircularDetection.js';
import { removeClass } from '../html/domUtils.js';

// #############################################################
// Toggle Port Routing - Enables/disables routing between input and output ports
// ###############################################################
function togglePortRouting(inPort, outPort, storeRoutingCallback) {
  const inMeta = getPortProperties(inPort);
  const outMeta = getPortProperties(outPort);
  logger.debug('togglePortRouting', inMeta.tagId, outMeta.tagId);

  midiBay.toggleRouting(inPort, outPort);
  storeRoutingCallback();
  setInportRoutingClass();
  setOutportRoutingClass();
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
    // Symmetric: Remove input port from output port inPortSet (garantiert vorhanden)
    outPortProbs.inPortSet.delete(inPort);
    // Remove input port from activeClockSourceSet (garantiert vorhanden bei Output-Ports)
    outPortProbs.activeClockSourceSet.delete(inPort);
    // Remove circular routing warning if it exists
    removeClass(inPortProbs.tag, 'circular_routing_warning');
  } else {
    // Try to create connection with circular routing protection
    preventCircularRouting(inPort, outPort);
  }
  drawAllRoutingLines();
}

// #############################################################
/**
 * Entfernt alle Routing-Verbindungen zu einem Output-Port.
 * Wird aufgerufen wenn ein Output-Port geschlossen wird.
 *
 * @param {MIDIOutput} outPort - Der Output-Port dessen Routings entfernt werden
 */
function removeAllRoutingsToOutput(outPort) {
  const outPortProbs = getPortProperties(outPort);
  logger.debug('removeAllRoutingsToOutput', outPortProbs.tagId);

  let routingsRemoved = false;

  // Nutze inPortSet des Output-Ports (garantiert vorhanden bei Output-Ports)
  if (outPortProbs.inPortSet.size > 0) {
    outPortProbs.inPortSet.forEach((inPort) => {
      const inPortProbs = getPortProperties(inPort);
      inPortProbs.outPortSet?.delete(outPort);
      inPortProbs.outPortNameSet?.delete(outPort.name);
      routingsRemoved = true;
      logger.debug(`Removed routing from ${inPortProbs.tagId} to ${outPortProbs.tagId}`);
    });
    // Symmetric cleanup: leere inPortSet
    outPortProbs.inPortSet.clear();
  }

  // Clear activeClockSourceSet (garantiert vorhanden bei Output-Ports)
  outPortProbs.activeClockSourceSet.clear();

  if (routingsRemoved) {
    storeRoutingOutPortName();
    setInportRoutingClass();
    setOutportRoutingClass();
    drawAllRoutingLines();
  }
}
