export { receiveMIDIMessage, getChannel };
import { midiBay } from './main.js';
import { getPortProperties } from './utils/helpers.js';
import { sendMidiMessageToModules } from './modules/moduleMsg.js';
import { showMidiMessageAsText, getLoopMessageHtml } from './html/htmlMessage.js';
import { logger } from './utils/logger.js';
import { midiInFilter, midiFilter, getStatusByte, getChannel } from './core/midiMessageFilter.js';
import { signal, lineSignal } from './core/midiMessageSignal.js';
import { formatMessageToHtmlAndCollectSysex } from './html/htmlMessageFormat.js';
import { sendCollectedSysexToSysexForm } from './sysex/sysex.js';
// ###################################################
// receiveMIDIMessage ####################################
// ###################################################
function receiveMIDIMessage(midiMessage) {
  const format = 'background-color: orange; color: darkblue;text-decoration: underline;';
  const format2 = 'background-color: darkblue ; color:orange;text-decoration: underline;';
  // logger.debug('%c receive MIDIMessage *** %c %s ', format, format2, midiMessage.target.name, [
  //   ...midiMessage.data,
  // ]);

  // test: ##############################################
  // if (!midiBay.initialized) {
  //   logger.warn('MIDI Message received but MIDI Port not initialized yet!');
  //   return;
  // }
  // #####################################################

  const inPort = midiMessage.target;
  const statusByte = getStatusByte(midiMessage.data[0]);
  midiMessage.isFiltered = false;
  if (!inPort || !statusByte) return;

  sendMidiMessageToModules(inPort.name, statusByte, [...midiMessage.data]);
  if (getMIDIInputMessage(midiMessage, statusByte, inPort)) {
    setMIDIOutputMessage(midiMessage, statusByte, inPort);
  }
  // logger.debug(
  //   '%c done MIDIMessage *** %c %s ',
  //   format,
  //   format2,
  //   midiMessage.target.name,
  //   midiBay.portPropertiesManager
  // );
}
// #########################################################################
// const messageData = extractSysex(sended.data) || sended.data; // sysex.js
// showMidiMessageAsText(messageData, inPort); // html.js

// async:
// safeBlofeldSoundDumpAsFile(sended.data); //  sysex/sysexFile.js
// #########################################################
function getMIDIInputMessage(midiMessage, statusByte, inPort) {
  // set text-messages and signals of Input Port inPort:

  // Signal of incomming In Data of Port inPort:
  signal('in', statusByte, inPort);

  // check for Port Filters:
  midiMessage.isFiltered = midiInFilter(midiMessage, statusByte, inPort);
  makeMidiMessageVisible(midiMessage, inPort);
  if (midiMessage.isFiltered) return false;

  // Signal of non filtered In Data of Port inPort:
  signal('out', statusByte, inPort);
  return true;
}
// ###########################################
function setMIDIOutputMessage(midiMessage, statusByte, inPort) {
  // set text-messages and signals of all Out Ports that the inPort is routed to:
  const inPortProps = getPortProperties(inPort);
  for (const outPort of inPortProps.outPortSet) {
    lineSignal('in', statusByte, inPort, outPort);

    if (isMidiLoop(outPort, midiMessage)) return;

    midiMessage.isFiltered = midiFilter(midiMessage, statusByte, outPort);
    makeMidiMessageVisible(midiMessage, outPort);
    if (midiMessage.isFiltered) continue;

    lineSignal('out', statusByte, inPort, outPort);
    outPort.send(midiMessage.data); // -> send midiData!!!
  }
}
// ###############################################
// make MIDI Message visible in Monitor
function makeMidiMessageVisible(midiMessage, port) {
  // logger.debug('makeMidiMessageVisible', midiMessage.data, port.id);
  if (reducedClockAndActiveSensingMessages(midiMessage.data[0], port)) return; // no 'Timing clock' as message!

  // Early exit: Wenn Monitor nicht sichtbar, keine Text-Updates nötig
  const monitorElement = document.getElementById('monitor');
  if (monitorElement && monitorElement.classList.contains('js-hidden')) return;

  const midiDataText = formatMessageToHtmlAndCollectSysex(midiMessage.data);

  showMidiMessageAsText(midiMessage, midiDataText, port);

  if (!midiBay.collectingSysEx && !midiBay.sysExWasSent) {
    sendCollectedSysexToSysexForm(midiBay.sysexMessage, port);
    midiBay.sysExWasSent = true;
  }
}
// ###########################################
function reducedClockAndActiveSensingMessages(midiData, port) {
  if (midiData != 248 && midiData != 254) return false; // not reduced. It's not a 'Timing clock' message and should pass!
  if (!midiBay.menuClockTag.classList.contains('visible_clock')) return true; // reduced! don't show 'Timing clock' messages if clock button is on!
  // logger.debug('reducedClockAndActiveSensingMessages', midiData, getPortProperties(port).clockBuffer);
  const portProbs = getPortProperties(port);
  portProbs.clockBuffer = (portProbs.clockBuffer || 0) + 1;
  portProbs.activeSenseBuffer = (portProbs.activeSenseBuffer || 0) + 1;
  if (midiData === 248 && portProbs.clockBuffer > 60) {
    portProbs.clockBuffer = 0;
    return false; // show one 'Timing clock' message after the pause!
  }
  if (midiData === 254 && portProbs.activeSenseBuffer > 4) {
    portProbs.activeSenseBuffer = 0;
    return false; // show one 'Timing clock' message after the pause!
  }
  return true; // reduced 'Timing clock' message will be blocked in makeMidiMessageVisible()!
}
// #####################################################
// Prüft, ob eine MIDI-Schleife vorliegt (doppelte Nachrichten).
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
    const midiDataText = getLoopMessageHtml(midiMessage, outPort);
    showMidiMessageAsText(midiMessage, midiDataText, outPort);
    midiBay.msgMonitor.isLoop = false;
    logger.warn('!!! Double Midi Message!!! -> ', outPort.name, outPort.type);
    return true;
  }

  return false;
}
// ###########################################

// ###########################################
// function sendMidiMessageToModules(inPort, statusByte, midiData) {
// console.log('send Midi Message To Modules', inPort.name, statusByte, midiData.length);
// if (midiData.length != 3 || statusByte != 176) return;

//   midiMessageToModules(inPort, getChannel(midiData[0]), statusByte, midiData[1], midiData[2]);
// }
