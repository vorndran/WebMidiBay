export { formatMidiMessageToHtml, getLoopMessageHtml };

import {
  cc,
  cc2,
  MIDI_SYSEX_START,
  MIDI_SYSEX_END,
  MIDI_TIMING_CLOCK,
} from '../constants/midiConstants.js';
import { getChannel, getMidiMsg, getNote } from '../utils/midiHelpers.js';
import { toHex } from '../sysex/sysexFormat.js';
import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
// ########################################################
// Performance: Use range-based dispatch instead of sequential if-checks
function formatMidiMessageToHtml(midiData, port = null) {
  const statusByte = midiData[0];

  // Fast path: Most common MIDI messages (128-239)
  if (statusByte >= 128 && statusByte < 240) {
    if (statusByte < 160) return noteToText(midiData); // 128-159: Note On/Off
    if (statusByte < 176) return controllerToText(midiData); // 160-175: Polyphonic Aftertouch
    if (statusByte < 192) return ccToText(midiData); // 176-191: CC
    return controllerToText(midiData); // 192-239: Program Change, Channel Aftertouch, Pitch Bend
  }

  // System messages and edge cases
  if (statusByte === 240) return sysexToText(); // MIDI_SYSEX_START
  if (statusByte === 247) return '--'; // MIDI_SYSEX_END
  if (statusByte > 240) return actionDataToText(midiData, port); // 241-255: System Real Time
  if (statusByte < 128) return '--'; // Data bytes (inside SysEx)

  return '--';
}
// Übersicht: Mögliche Status-Bytes vs. Datenbytes
// Bereich	Bedeutung	Datenbytes
// 0x80–0xEF	Channel Messages	0x00–0x7F (niemals ≥0x80)
// 0xF0	SysEx Start	Datenbytes 0x00–0x7F bis...
// 0xF7	SysEx End	... dieses Byte
// 0xF1–0xF6	System Common	0x00–0x7F
// 0xF8–0xFF	RealTime	Keine Datenbytes (1-Byte-Messages)
// ########################################################
function sysexToText() {
  const sysexArray = Array.from(midiBay.sysexMessage);
  if (sysexArray.length <= 0) {
    return '<span class="sysex">SysEx Data (to view data: enable \'auto-collect sysex\' in SysEx)</span>';
  }

  if (sysexArray.length <= 10)
    return `<span class="sysex">hex (${hexStringFromIntArraySmall(sysexArray)})</span>`;

  return `<span class="sysex">hex (${hexStringFromIntArraySmall(
    sysexArray.slice(0, 10)
  )}| ... <span class="see_sysex"> ( ${sysexArray.length} digits, see "SysEx"!)</span>`;
}
// ########################################################
function hexStringFromIntArraySmall(intArray) {
  return toHex(intArray).join(' | ');
}
// ########################################################
function noteToText(midiData) {
  return `<span class="channel text-msg">${getChannel(midiData[0])}</span>
  <span class="noteonoroff text-msg">${getMidiMsg(midiData[0])}</span>
  <span class="note text-msg">${getNote(midiData[1])}</span>
  <span class="velocity text-msg">${midiData[2]}</span>${rawDataText(midiData)}`;
}
// ########################################################
function ccToText(midiData) {
  return `<span class="channel text-msg">${getChannel(midiData[0])}</span>
  <span class="mididata1 text-msg">${cc[midiData[1]]}</span>
  <span class="mididata2 text-msg">${midiData[2]}</span>${rawDataText(midiData)}`;
}
// ########################################################
function controllerToText(midiData) {
  // If midiData[2] doesn't exist, leave empty (Channel Pressure and Program Change)
  const midiData2 = midiData[2] ? `<span class="mididata2 text-msg">${midiData[2]}</span>` : '';
  return `<span class="channel text-msg">${getChannel(midiData[0])}</span>
  <span class="mididata1 text-msg">${getMidiMsg(midiData[0])}</span>
  <span class="mididata1 text-msg">${midiData[1]}</span>
  ${midiData2}${rawDataText(midiData)}`;
}
// ########################################################
function actionDataToText(midiData, port = null) {
  const portProps = port ? getPortProperties(port) : null;
  const hasClockFilter = portProps?.filterSet?.has(MIDI_TIMING_CLOCK) || false;
  const clockClass =
    midiData[0] === MIDI_TIMING_CLOCK &&
    portProps?.type === 'output' &&
    !hasClockFilter &&
    portProps?.activeClockSourceSet?.size > 1
      ? 'multiple_clock_sources'
      : '';
  return `<span class="action_data ${clockClass}">"${
    cc2[midiData[0]]
  }" ${clockClass} </span>${rawDataText(midiData)}`;
}
// ########################################################
function rawDataText(midiData) {
  // Filter only defined values (allows 0 as valid value)
  const validData = [...midiData].filter((byte) => byte !== undefined);
  const hexData = toHex(validData);

  const dataString = validData.join(',');
  const hexString = hexData.join('|');

  return `<span class="rawdata">- data:(${dataString}) - hex:(${hexString})</span>`;
}
// ########################################################
function getLoopMessageHtml(midiMessage) {
  return `<span class="doublemidimessage"> Double Midi Message!!!</span>${rawDataText(
    midiMessage.data
  )}`;
}
// ########################################################
