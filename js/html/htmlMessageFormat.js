export { formatMessageToHtmlAndCollectSysex };

import { cc, cc2 } from '../constants/midiConstants.js';
import { getChannel, getMidiMsg, getNote } from '../utils/midiHelpers.js';
import { collectSysexData, toHex } from '../sysex/sysex.js';
import { midiBay } from '../main.js';

// ########################################################
function formatMessageToHtmlAndCollectSysex(midiData) {
  // 240 oder Laenge > 3 = sysex!
  if (midiData[0] > 127 && midiData[0] < 160) return noteToText(midiData); // < 160 = note on, note off:
  if (midiData[0] < 176) return controllerToText(midiData); // 160 - 175 = Polyphonic Aftertouch
  if (midiData[0] < 192) return ccToText(midiData); // 176 = CC
  if (midiData[0] < 240) return controllerToText(midiData); // 160 - 239 = other Controller
  if (midiData[0] == 240) return sysexToTextAndCollectData(midiData);
  if (midiData[0] == 247) collectSysexData(midiData); // 247 =  EOF
  if (midiData[0] > 240) return actionDataToText(midiData); // 241 - 255 = action data
  if (midiData[0] < 128) collectSysexData(midiData); // < 128 = kein Statusbyte oder EOF
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
function sysexToTextAndCollectData(midiData) {
  collectSysexData(midiData);
  if (midiBay.collectingSysEx)
    return '<span class="sysex">SysEx Data (incomplete, collecting...)</span>';
  const sysexArray = Array.from(midiBay.sysexMessage);
  return `<span class="sysex">hex (${hexStringFromIntArraySmall(
    sysexArray.slice(0, 12)
  )}| ... <span class="see_sysex"> ( ${sysexArray.length} digits, see "Sysex"!)</span>`;
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
  // wenn midiData[2] nicht existiert, dann leer lassen. (bei Channel Pressure und Program Change)
  const midiData2 = midiData[2] ? `<span class="mididata2 text-msg">${midiData[2]}</span>` : '';
  return `<span class="channel text-msg">${getChannel(midiData[0])}</span>
  <span class="mididata1 text-msg">${getMidiMsg(midiData[0])}</span>
  <span class="mididata1 text-msg">${midiData[1]}</span>
  ${midiData2}${rawDataText(midiData)}`;
}
// ########################################################
function actionDataToText(midiData) {
  return `<span class="action_data">"${cc2[midiData[0]]}"</span>${rawDataText(midiData)}`;
}
// ########################################################
function rawDataText(midiData) {
  // wenn midiData[2] nicht existiert, dann leer lassen. (bei Channel Pressure und Program Change)
  const midiData2 = midiData[2] ? `,${midiData[2]}` : '';
  const midiData2Hex = midiData[2] ? `|${toHex(midiData)[2]}` : '';
  return `<span class="rawdata">- data:(${midiData[0]},${midiData[1]}${midiData2}) - hex:(${
    toHex(midiData)[0]
  }|${toHex(midiData)[1]}${midiData2Hex})</span>`;
}
// ########################################################
function printMessageType(midiData) {
  if (midiData[0] == 240 || midiData.length > 3) return 'sysex';
  if (midiData[0] < 160) return 'note'; // < 160 = note on, note off:
  if (midiData[0] < 176) return 'controller'; // 160 - 239 = other Controller
  if (midiData[0] < 192) return 'cc'; // 176 = CC
  if (midiData[0] < 240) return 'controller'; // 160 - 239 = other Controller
  if (midiData[0] > 240) return 'action_data'; // 241 - 255 = action data
  return 'unknown';
}
// ########################################################
// function collectSysexDataBlock(midiData, eofByte) {
//   let dataString = '';
//   midiData.forEach((dataByte) => {
//     dataString += `${dataByte},`;
//   });
//   dataString = dataString.slice(0, -1); // letztes Komma entfernen
//   if (eofByte)
//     return `<span class="sysex">SysEx Data (incomplete): [${dataString}] - EOF Byte: ${eofByte}</span>`;
//   return `<span class="sysex">SysEx Data (incomplete): [${dataString}]</span>`;
// }
// ########################################################
