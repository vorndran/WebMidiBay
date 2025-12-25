export {
  setPortTagSignal,
  setPortTagAndRoutingLineSignal,
  trackOutputClockSources,
  updateAllOutputPortClockWarnings,
};

import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { routingLinesUnvisible } from '../routing/routingLinesSvg.js';
import { addClass, removeClass, hasClass } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import { updateLayout } from '../html/htmlUpdater.js';
import { MIDI_TIMING_CLOCK, MIDI_ACTIVE_SENSING } from '../constants/midiConstants.js';

const signalInPortTagSet = new Set();
const signalOutPortTagSet = new Set();
const signalPortTagMap = { in: signalInPortTagSet, out: signalOutPortTagSet };

// ################################################
function setPortTagAndRoutingLineSignal(inOrOut, statusByte, inPort, outPort) {
  const inPortProbs = getPortProperties(inPort);
  const outPortProbs = getPortProperties(outPort);
  const lineTagId = `${inPortProbs.tagId}-${outPortProbs.tagId}`;
  setPortTagSignal(inOrOut, statusByte, outPort, lineTagId, inPort);
}

// ################################################
function setPortTagSignal(inOrOut, statusByte, port, lineTagId, inPort = null) {
  const portProbs = getPortProperties(port);

  // Handle Clock/Active Sensing signals with permanent icon
  if (handleClockAndActiveSensingSignal(inOrOut, statusByte, portProbs, inPort)) return;

  // Early exit: Visual Signals disabled
  if (!midiBay.signalsEnabled) return;

  // Prevent multiple signals on same port tag
  if (signalPortTagMap[inOrOut].has(portProbs.tagId)) return;
  // Collect port tags with signals in a Set to prevent duplicate signals
  signalPortTagMap[inOrOut].add(portProbs.tagId);

  const signal = inOrOut == 'in' ? 'insignal' : 'outsignal';
  setPortTagAndRoutingLineSignalClassWithTimer(portProbs, inOrOut, lineTagId, signal);
}
// #########################################################
function setPortTagAndRoutingLineSignalClassWithTimer(portProbs, inOrOut, lineTagId, signal) {
  // Add CSS class for port signal
  addClass(portProbs.tag, signal);
  // Add CSS class for routing line signal if line exists and is visible
  if (lineTagId && !routingLinesUnvisible()) addClass(midiBay.lineMap.get(lineTagId), 'signal');

  setTimeout(() => {
    signalPortTagMap[inOrOut].delete(portProbs.tagId);
    removeClass(portProbs.tag, signal);
    // removeClass is safe even if line no longer exists/visible
    if (lineTagId) removeClass(midiBay.lineMap.get(lineTagId), 'signal');
  }, 300);
}
// #########################################################
function handleClockAndActiveSensingSignal(inOrOut, statusByte, portProbs, inPort) {
  if (statusByte !== MIDI_TIMING_CLOCK && statusByte !== MIDI_ACTIVE_SENSING) return false; // Not a Clock/Active Sensing message

  if (
    (portProbs.type === 'input' && inOrOut === 'in') ||
    (portProbs.type === 'output' && inOrOut === 'out')
  )
    clockAndActiveSensingSignal(portProbs, statusByte, inPort); // Permanent clock_active CSS class

  // If it's an output port and inPort is known, add to activeClockSourceSet
  if (
    statusByte === MIDI_TIMING_CLOCK &&
    portProbs.type === 'output' &&
    inOrOut === 'out' &&
    inPort
  ) {
    trackClockSourceForOutput(portProbs, inPort);
  }

  return true;
}

// #########################################################
function clockAndActiveSensingSignal(portProbs, statusByte, inPort = null) {
  const isClock = statusByte === MIDI_TIMING_CLOCK;
  const timestampKey = isClock ? 'clockTimestamp' : 'activeSensingTimestamp';
  const timerKey = isClock ? 'clockTimer' : 'activeSensingTimer';
  const cssClass = isClock ? 'clock_active' : 'active_sensing_active';

  // Update corresponding timestamp
  portProbs[timestampKey] = Date.now();

  // On first start: Set CSS class
  const isFirstStart = !portProbs[timerKey];
  if (isFirstStart) {
    addClass(portProbs.tag, cssClass);
    updateLayout();
  }

  // Start timer for port visual (CSS class)
  startRecurringTimer(portProbs, timestampKey, timerKey, () => {
    removeClass(portProbs.tag, cssClass);
    updateLayout();
  });
}
// #########################################################
/**
 * Verfolgt Clock-Quellen für Output-Ports und startet Timer im Input-Port.
 * @param {Object} portProbs - Properties des Output-Ports
 * @param {Object} inPort - Der Input-Port als Clock-Quelle
 */
function trackClockSourceForOutput(portProbs, inPort) {
  const inPortProbs = getPortProperties(inPort);
  portProbs.activeClockSourceSet.add(inPort);
  trackOutputClockSources(portProbs);

  // Start timer in input port that updates all connected outputs
  startRecurringTimer(inPortProbs, 'clockTimestamp', 'inputClockTimer', () => {
    // Callback: Remove input from all connected output activeClockSourceSets
    if (inPortProbs.outPortSet) {
      inPortProbs.outPortSet.forEach((outPort) => {
        const outPortProbs = getPortProperties(outPort);
        if (outPortProbs.activeClockSourceSet) {
          outPortProbs.activeClockSourceSet.delete(inPort);
          trackOutputClockSources(outPortProbs);
          logger.debug(
            `Removed inactive clock source ${inPortProbs.tagId} from ${outPortProbs.tagId}`
          );
        }
      });
    }
  });
}
// #########################################################
/**
 * Generic helper function for recurring timeout checks.
 * Checks every 1s if timestamp is older than 1s and executes callback.
 *
 * @param {Object} targetObj - Object with timestamp and timer
 * @param {string} timestampKey - Key for timestamp (e.g. 'clockTimestamp')
 * @param {string} timerKey - Key for timer ID (e.g. 'clockTimer')
 * @param {Function} onTimeout - Callback on timeout (after 1s without update)
 */
function startRecurringTimer(targetObj, timestampKey, timerKey, onTimeout) {
  // Update timestamp
  targetObj[timestampKey] = Date.now();

  // If timer already running, only update timestamp
  if (targetObj[timerKey]) return;

  logger.debug(`Starting timer ${timerKey}`);

  const checkActive = () => {
    if (Date.now() - targetObj[timestampKey] >= 1000) {
      // Timeout → Cleanup and execute callback
      targetObj[timerKey] = null;
      onTimeout();
      logger.debug(`Timer ${timerKey} expired`);
    } else {
      // Still active → Check again in 1s
      targetObj[timerKey] = setTimeout(checkActive, 1000);
    }
  };

  targetObj[timerKey] = setTimeout(checkActive, 1000);
}

// #########################################################
/**
 * Aktualisiert Clock-Warnings für alle Output-Ports.
 * Wird aufgerufen wenn Clock-Filter geändert werden.
 */
function updateAllOutputPortClockWarnings() {
  midiBay.portByTagIdMap.forEach((port) => {
    const portProbs = getPortProperties(port);
    if (portProbs.type === 'output' && portProbs.activeClockSourceSet) {
      trackOutputClockSources(portProbs);
    }
  });
}

// #########################################################
/**
 * Überwacht Output-Ports auf mehrere Clock-Quellen.
 * Prüft activeClockSourceSet und setzt CSS-Klasse 'multiple_clock_sources'.
 *
 * @param {Object} outPortProbs - Port-Properties des Output-Ports
 */
function trackOutputClockSources(outPortProbs) {
  if (!outPortProbs.activeClockSourceSet) return;

  const hasClockFilter = outPortProbs?.filterSet?.has(MIDI_TIMING_CLOCK) || false;
  const globalClockFilter = midiBay?.globalFilterSet?.has(MIDI_TIMING_CLOCK) || false;

  // Early exit: If clock is filtered, no warning needed
  if (hasClockFilter || globalClockFilter) {
    // Only removeClass if class exists (performance optimization)
    if (hasClass(outPortProbs.tag, 'multiple_clock_sources')) {
      removeClass(outPortProbs.tag, 'multiple_clock_sources');
    }
    return;
  }

  // Only change DOM when status changes (performance optimization)
  const hasWarning = hasClass(outPortProbs.tag, 'multiple_clock_sources');
  const shouldWarn = checkActiveClockSourcesForOutputPorts(outPortProbs);
  if (shouldWarn && !hasWarning) {
    addClass(outPortProbs.tag, 'multiple_clock_sources');
  } else if (!shouldWarn && hasWarning) {
    removeClass(outPortProbs.tag, 'multiple_clock_sources');
  }
}

// #########################################################
function checkActiveClockSourcesForOutputPorts(outPortProbs) {
  for (const port of outPortProbs.activeClockSourceSet) {
    const portProbs = getPortProperties(port);
    if (portProbs.filterSet?.has(MIDI_TIMING_CLOCK)) {
      outPortProbs.activeClockSourceSet.delete(port);
    }
  }
  return outPortProbs.activeClockSourceSet.size > 1;
}
// #########################################################
