export { receiveMIDIMessage, getChannel, reducedClockAndActiveSensingMessages };
import { midiBay } from './main.js';
import { getPortProperties } from './utils/helpers.js';
import { hasClass } from './html/domUtils.js';
import { showMidiMessageAsText } from './message/messageMonitor.js';
import { logger } from './utils/logger.js';
import { midiInFilter, midiFilter, getStatusByte, getChannel } from './filter/messageFilter.js';
import { setPortTagSignal, setPortTagAndRoutingLineSignal } from './ports/portSignals.js';
import { formatMidiMessageToHtml } from './message/messageFormat.js';
import { collectSysexData } from './sysex/sysexData.js';
import { sendCollectedSysexToSysexFormAction } from './sysex/sysexFileActions.js';
import { MIDI_TIMING_CLOCK, MIDI_ACTIVE_SENSING } from './constants/midiConstants.js';
import { sendTemporaryTextToTag } from './ports/portInteraction.js';
import { updateLayout } from './html/htmlUpdater.js';
// ###################################################
// receiveMIDIMessage ####################################
// ###################################################
function receiveMIDIMessage(midiMessage) {
  const inPort = midiMessage.target;
  const statusByte = getStatusByte(midiMessage.data[0]);
  midiMessage.isFiltered = false;
  if (!inPort || !statusByte) return;

  if (getMIDIInputMessage(midiMessage, statusByte, inPort)) {
    setMIDIOutputMessage(midiMessage, statusByte, inPort);
  }
}
// #########################################################
function getMIDIInputMessage(midiMessage, statusByte, inPort) {
  // Set text-messages and signals of Input Port

  // Visual signal for incoming data
  setPortTagSignal('in', statusByte, inPort);

  // Apply port filters (pass portProperties to avoid WeakMap lookup)
  const inPortProps = getPortProperties(inPort);
  midiMessage.isFiltered = midiInFilter(midiMessage, statusByte, inPort, inPortProps);
  makeMidiMessageVisible(midiMessage, inPort);
  if (midiMessage.isFiltered) return false;

  // Visual signal for non-filtered data
  setPortTagSignal('out', statusByte, inPort);
  return true;
}
// ###########################################
function setMIDIOutputMessage(midiMessage, statusByte, inPort) {
  // set text-messages and signals of all Out Ports that the inPort is routed to:
  const inPortProps = getPortProperties(inPort);
  for (const outPort of inPortProps.outPortSet) {
    setPortTagAndRoutingLineSignal('in', statusByte, inPort, outPort);

    // Check for potential MIDI loop (warning only, does not block)
    checkMidiLoop(outPort, midiMessage);

    // Pass portProperties to avoid WeakMap lookup in hot path
    const outPortProps = getPortProperties(outPort);
    midiMessage.isFiltered = midiFilter(midiMessage, statusByte, outPort, outPortProps);
    makeMidiMessageVisible(midiMessage, outPort);
    if (midiMessage.isFiltered) continue;

    setPortTagAndRoutingLineSignal('out', statusByte, inPort, outPort);

    // Send MIDI data with error handling
    try {
      if (outPort.state === 'connected') {
        outPort.send(midiMessage.data);
      } else {
        logger.warn(`Cannot send MIDI: Port ${outPort.name} is ${outPort.state}`);
      }
    } catch (error) {
      logger.error(`Error sending MIDI to ${outPort.name}:`, error.message);
    }
  }
}
// ###############################################
// Make MIDI Message visible in Monitor
function makeMidiMessageVisible(midiMessage, port) {
  if (reducedClockAndActiveSensingMessages(midiMessage.data[0], port)) return; // Throttle Clock/Active Sensing messages

  // SysEx Collection unabhängig vom Monitor (wenn aktiviert)
  if (midiBay.autoCollectSysex) {
    collectSysexData(midiMessage.data);

    if (!midiBay.collectingSysEx && !midiBay.sysExWasSent) {
      sendCollectedSysexToSysexFormAction(midiBay.sysexMessage, port);
      midiBay.sysExWasSent = true;
    }
  }

  // Early exit für Monitor-UI
  const monitorElement = document.getElementById('monitor');
  if (monitorElement && hasClass(monitorElement, 'js-hidden')) return;

  const midiDataText = formatMidiMessageToHtml(midiMessage.data, port);
  showMidiMessageAsText(midiMessage, midiDataText, port);
}
// ###########################################
function reducedClockAndActiveSensingMessages(midiData, port) {
  if (midiData !== MIDI_TIMING_CLOCK && midiData !== MIDI_ACTIVE_SENSING) return false; // Not a Clock/Active Sensing message, pass through
  if (!hasClass(midiBay.menuClockTag, 'visible_clock')) return true; // Clock display disabled, block message

  const portProbs = getPortProperties(port);
  portProbs.clockBuffer = (portProbs.clockBuffer || 0) + 1;
  portProbs.activeSenseBuffer = (portProbs.activeSenseBuffer || 0) + 1;

  if (midiData === MIDI_TIMING_CLOCK && portProbs.clockBuffer > 80) {
    portProbs.clockBuffer = 0;
    return false; // Show one Clock message after 80 messages
  }
  if (midiData === MIDI_ACTIVE_SENSING && portProbs.activeSenseBuffer > 6) {
    portProbs.activeSenseBuffer = 0;
    return false; // Show one Active Sensing message after 6 messages
  }
  return true; // Block message (throttled)
}
// #####################################################
// Check for potential MIDI feedback loop (duplicate messages in short time)
// Note: Relative controllers (MCU protocol) intentionally send identical messages!
// This function only WARNS, does NOT filter messages or block execution.
function checkMidiLoop(outPort, midiMessage) {
  const portProps = getPortProperties(outPort);
  const midiData = midiMessage.data;

  // Early exit: Only check 3-byte messages (Note, CC, etc.)
  if (midiData.length !== 3) return;

  const now = Date.now();
  const formerData = portProps.lastData;
  const formerTimestamp = portProps.lastDataTimestamp || 0;

  // Fast comparison: All 3 bytes at once
  const isDuplicate =
    formerData &&
    formerData.length === 3 &&
    formerData[0] === midiData[0] &&
    formerData[1] === midiData[1] &&
    formerData[2] === midiData[2];

  // Update tracking data
  portProps.lastData = midiData;
  portProps.lastDataTimestamp = now;

  // Check if duplicate arrived suspiciously fast (< 10ms = likely loop)
  // But allow legitimate duplicates after 10ms+ (MCU relative controllers)
  if (isDuplicate && now - formerTimestamp < 10) {
    // Throttle warnings: max 1 per second per port
    const lastWarning = portProps.lastLoopWarning || 0;
    if (now - lastWarning > 1000) {
      portProps.lastLoopWarning = now;

      // Visual warning on port tag
      sendTemporaryTextToTag(portProps.tag, '⚠️ Possible MIDI Loop!');
      updateLayout(true); // Layout-Update nach Warnung

      // Show warning in monitor if open
      const monitorElement = document.getElementById('monitor');
      if (monitorElement && !hasClass(monitorElement, 'js-hidden')) {
        const loopWarningText = `⚠️ Possible MIDI loop: duplicate within ${
          now - formerTimestamp
        }ms`;
        const warningMessage = `<span class="loop_warning">${loopWarningText}</span>`;
        showMidiMessageAsText({ isFiltered: false, data: midiData }, warningMessage, outPort);
      }

      logger.warn(
        `⚠️ Possible MIDI loop detected: ${outPort.name} received duplicate message within ${
          now - formerTimestamp
        }ms`
      );
    }
  }
}
// ###########################################
// EOF
