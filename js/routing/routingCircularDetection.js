/**
 * Circular Routing Detection
 * Prevents MIDI feedback loops by detecting circular routing paths BEFORE they are created
 */

export { preventCircularRouting };

import { getPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { addClass, removeClass } from '../html/domUtils.js';
import { sendTemporaryTextToTag } from '../ports/portInteraction.js';

/**
 * Detects if adding a routing connection would create a circular path.
 * Uses Depth-First Search (DFS) to find cycles in the routing graph.
 *
 * @param {MIDIInput} inPort - The source input port
 * @param {MIDIOutput} outPort - The destination output port
 * @returns {boolean} True if circular routing would be created
 */
function detectCircularRouting(inPort, outPort) {
  // Early exit: Output ports cannot create cycles (they don't have outgoing connections)
  if (!outPort || outPort.type !== 'output') return false;

  // Check if the outPort can somehow route back to inPort
  // by following all possible paths through the routing graph
  const visited = new Set();
  const recursionStack = new Set();

  /**
   * DFS helper function to detect cycles
   * @param {MIDIPort} currentPort - Current port in the traversal
   * @returns {boolean} True if cycle detected
   */
  function hasCycle(currentPort) {
    // Found inPort again → Circular path detected!
    if (currentPort === inPort) {
      logger.warn(
        `Circular routing detected: ${inPort.name} → ... → ${outPort.name} → ... → ${inPort.name}`
      );
      return true;
    }

    // Already processed this port in current path → Cycle detected
    if (recursionStack.has(currentPort)) return true;

    // Already fully explored this port → No cycle from here
    if (visited.has(currentPort)) return false;

    visited.add(currentPort);
    recursionStack.add(currentPort);

    // Follow all outgoing connections from current port
    const currentPortProps = getPortProperties(currentPort);

    // Only input ports have outgoing connections (outPortSet)
    if (currentPort.type === 'input' && currentPortProps.outPortSet) {
      for (const nextPort of currentPortProps.outPortSet) {
        if (hasCycle(nextPort)) {
          recursionStack.delete(currentPort);
          return true;
        }
      }
    }

    recursionStack.delete(currentPort);
    return false;
  }

  // Start DFS from the proposed new connection's destination (outPort)
  // Check if we can reach back to inPort
  return hasCycle(outPort);
}

// #############################################################
/**
 * Prevents circular routing by checking for cycles and creating connection only if safe.
 * Checks for circular paths and prevents connection if loop would be created.
 *
 * @param {MIDIInput} inPort - The source input port
 * @param {MIDIOutput} outPort - The destination output port
 * @returns {boolean} True if connection was created, false if prevented due to circular routing
 */
function preventCircularRouting(inPort, outPort) {
  const inPortProbs = getPortProperties(inPort);
  const outPortProbs = getPortProperties(outPort);

  // Check for circular routing BEFORE creating connection
  if (detectCircularRouting(inPort, outPort)) {
    logger.warn(
      `⚠️ Circular routing prevented: ${inPort.name} → ${outPort.name} would create a feedback loop`
    );
    // Add visual warning to port tag for 3 seconds
    sendTemporaryTextToTag(inPortProbs.tag, '⚠️ Circular Routing!', 'circular_routing_warning');
    return false; // Connection NOT created
  }

  // Safe to create connection
  inPortProbs.outPortSet.add(outPort);
  inPortProbs.outPortNameSet.add(outPort.name);

  // Symmetric: Add input port to output port inPortSet (garantiert vorhanden)
  outPortProbs.inPortSet.add(inPort);

  return true; // Connection created successfully
}
