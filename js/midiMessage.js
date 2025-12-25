export { receiveMIDIMessage, getChannel, reducedClockAndActiveSensingMessages };
import { midiBay } from './main.js';
import { getPortProperties } from './utils/helpers.js';
import { hasClass } from './html/domUtils.js';
import { showMidiMessageAsText } from './html/htmlMessage.js';
import { logger } from './utils/logger.js';
import { midiInFilter, midiFilter, getStatusByte, getChannel } from './core/midiMessageFilter.js';
import { setPortTagSignal, setPortTagAndRoutingLineSignal } from './core/midiMessageSignal.js';
import {
  formatMessageToHtmlAndCollectSysex,
  getLoopMessageHtml,
} from './html/htmlMessageFormat.js';
import { collectSysexData } from './sysex/sysexData.js';
import { sendCollectedSysexToSysexFormAction } from './sysex/sysexFileActions.js';
import { MIDI_TIMING_CLOCK, MIDI_ACTIVE_SENSING } from './constants/midiConstants.js';
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

    if (isMidiLoop(outPort, midiMessage)) return;

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

  const midiDataText = formatMessageToHtmlAndCollectSysex(midiMessage.data, port);
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
// Check for MIDI feedback loop (duplicate messages)
function isMidiLoop(outPort, midiMessage) {
  const portProps = getPortProperties(outPort);
  const midiData = midiMessage.data;

  // Early exit: Nur 3-Byte Messages prüfen (Note, CC, etc.)
  if (midiData.length !== 3) return false;

  const formerData = portProps.lastData;

  // Schneller Vergleich: Alle 3 Bytes auf einmal
  const isLoop =
    formerData &&
    formerData.length === 3 &&
    formerData[0] === midiData[0] &&
    formerData[1] === midiData[1] &&
    formerData[2] === midiData[2];

  // lastData nur bei 3-Byte Messages aktualisieren
  portProps.lastData = midiData;

  if (isLoop) {
    midiBay.msgMonitor.isLoop = true;
    midiMessage.isFiltered = true;
    const midiDataText = getLoopMessageHtml(midiMessage);
    showMidiMessageAsText(midiMessage, midiDataText, outPort);
    midiBay.msgMonitor.isLoop = false;
    logger.warn('!!! Double Midi Message!!! -> ', outPort.name, outPort.type);
    return true;
  }

  return false;
}
// ###########################################
// EOF
