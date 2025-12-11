export { midiInFilter, midiFilter, getStatusByte, getChannel, setChannel };

import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

// ###########################################
function midiInFilter(midiMessage, statusByte, inPort) {
  if (midiBay.globalFilterSet.has(statusByte.toString())) return true;
  if (midiBay.globalChannel.filter > 0) {
    if (midiBay.globalChannel.filter - 1 != getChannel(midiMessage.data[0])) return true;
  }
  if (midiBay.globalChannel.reset > 0)
    midiMessage.data[0] = setChannel(statusByte, midiBay.globalChannel.reset);

  return midiFilter(midiMessage, statusByte, inPort);
}

// ###########################################
function midiFilter(midiMessage, statusByte, port) {
  const meta = getPortProperties(port);
  if (meta.filterSet.has(statusByte.toString())) return true;
  if (meta.channel.filter > 0) {
    if (meta.channel.filter - 1 != getChannel(midiMessage.data[0])) return true;
  }
  if (meta.channel.reset > 0) midiMessage.data[0] = setChannel(statusByte, meta.channel.reset);

  return false;
}

// ###########################################
function getStatusByte(midiData0) {
  const statusByte = midiData0 < 240 ? midiData0 - (midiData0 % 16) : midiData0;
  return statusByte;
}

// ###########################################
function getChannel(midiData0) {
  const channel = midiData0 < 240 ? midiData0 % 16 : null;
  return channel;
}

// ###########################################
function setChannel(statusByte, channel) {
  logger.debug('set Channel', statusByte, channel, Number(channel));

  if (statusByte >= 240) return statusByte;
  return statusByte + Number(channel) - 1;
}
