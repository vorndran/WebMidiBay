export { midiInFilter, midiFilter, getStatusByte, getChannel, setChannel };

import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { MIDI_SYSEX_START } from '../constants/midiConstants.js';

// ###########################################
/**
 * Wendet Channel-Filter und Channel-Reset auf eine MIDI-Nachricht an
 * @param {Object} midiMessage - Die MIDI-Nachricht
 * @param {number} statusByte - Das Status-Byte
 * @param {Object} channel - Channel-Objekt mit filter/reset Properties
 * @returns {boolean} true wenn Nachricht gefiltert werden soll
 */
function applyChannelFilter(midiMessage, statusByte, channel) {
  // Channel-Filter: Nur bestimmten Channel durchlassen
  if (channel.filter > 0) {
    if (channel.filter - 1 != getChannel(midiMessage.data[0])) return true;
  }

  // Channel-Reset: Channel-Nummer ändern (nur für Channel Messages < System Messages)
  if (channel.reset > 0 && statusByte < MIDI_SYSEX_START) {
    midiMessage.data[0] = setChannel(statusByte, channel.reset);
  }

  return false;
}

// ###########################################
function midiInFilter(midiMessage, statusByte, inPort, inPortProps = null) {
  // Globaler Filter-Check
  if (midiBay.globalFilterSet.has(statusByte)) return true;

  // Globaler Channel-Filter/Reset
  if (applyChannelFilter(midiMessage, statusByte, midiBay.globalChannel)) return true;

  // Port-spezifischer Filter (pass portProperties to avoid WeakMap lookup)
  return midiFilter(midiMessage, statusByte, inPort, inPortProps);
}

// ###########################################
function midiFilter(midiMessage, statusByte, port, portProps = null) {
  // Use provided portProperties or fall back to WeakMap lookup (for backward compatibility)
  const meta = portProps || getPortProperties(port);

  // Port-spezifischer Filter-Check
  if (meta.filterSet.has(statusByte)) return true;

  // Port-spezifischer Channel-Filter/Reset
  return applyChannelFilter(midiMessage, statusByte, meta.channel);
}

// ###########################################
function getStatusByte(midiData0) {
  const statusByte = midiData0 < MIDI_SYSEX_START ? midiData0 - (midiData0 % 16) : midiData0;
  return statusByte;
}

// ###########################################
function getChannel(midiData0) {
  const channel = midiData0 < MIDI_SYSEX_START ? midiData0 % 16 : null;
  return channel;
}

// ###########################################
function setChannel(statusByte, channel) {
  logger.debug('set Channel', statusByte, channel, Number(channel));

  if (statusByte >= MIDI_SYSEX_START) return statusByte;
  return statusByte + Number(channel) - 1;
}
