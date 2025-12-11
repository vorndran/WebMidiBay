export {
  sendCollectedSysexToSysexForm,
  toHex,
  extractSysex,
  hexStringFromIntArray,
  autoSaveSysex,
  clearSysexTable,
  showSysexTable,
  collectSysexData,
};

import { downloadSysexFile } from '../html/htmlForm.js';
import { resetViewContentButtons } from '../sysex/sysexFile.js';
import { midiBay, soundMap } from '../main.js';
import { logger } from '../utils/logger.js';
import { addClass } from '../html/domStyles.js';
import { toggleDisplayClass } from '../html/domStyles.js';

const sysex_start_byte = 240;
const sysex_end_byte = 247;
// ##############################################
// kommt von collectSysexData wenn Sysex End Byte empfangen wurde
function sendCollectedSysexToSysexForm(midiData, port) {
  logger.debug('sysex To Message');

  showSysexTable(midiData, port.name);
  resetViewContentButtons();
  if (midiBay.collectingSysEx) return;

  if (midiBay.autoSaveSysex) downloadSysexFile();
  return;
}
// ##############################################
function collectSysexData(midiData) {
  let lastByte = midiData[midiData.length - 1];

  if (midiData[0] == sysex_start_byte) {
    midiBay.sysexMessage = [];
    midiBay.sysExWasSent = false;
    midiBay.collectingSysEx = true;
  } else if (!midiBay.collectingSysEx) return;

  const parsedSysexData = parseSysexData(midiData);

  concatSysexArray(parsedSysexData);

  if (lastByte == sysex_end_byte) {
    midiBay.collectingSysEx = false;
    // sendCollectedSysexToSysexForm(midiBay.sysexMessage);
  }
}
// ##############################################
function concatSysexArray(sysexArray) {
  let sysexMsg = Array.from(midiBay.sysexMessage);
  midiBay.sysexMessage = sysexMsg.concat(Array.from(sysexArray));
}
// ##############################################
function parseSysexData(midiData) {
  // Fast-Path: Keine SysEx-Sammlung und kein SysEx-Start

  let sysExBuffer = [];
  // Byteweise parsen
  for (let i = 0; i < midiData.length; i++) {
    const b = midiData[i];

    if (b === 0xf0) {
      sysExBuffer = [0xf0];
      continue;
    }
    if (b < 0x80) {
      sysExBuffer.push(b);
      continue;
    }
    if (b === 0xf7) {
      sysExBuffer.push(b);
    }
  }
  return sysExBuffer;
}
// ##############################################
function clearSysexTable() {
  document.querySelector('div.sysex').innerHTML = '';
}
// ##############################################
function showSysexTable(sysexArray, portNameOrFileName) {
  logger.debug('show Sysex Table');

  const rowCount = Math.ceil(sysexArray.length / 10);
  const sysexTag = document.querySelector('div.sysex');

  // Separater Container für Tabelle, damit File-Liste erhalten bleibt
  let tableContainer = document.getElementById('sysex_table_container');
  if (!tableContainer) {
    tableContainer = document.createElement('div');
    tableContainer.id = 'sysex_table_container';
    addClass(tableContainer, 'sysex_table');
    sysexTag.appendChild(tableContainer);
  }

  const firstRow = document.createElement('p');
  addClass(firstRow, 'firstrow');
  firstRow.innerHTML = `<span class="firstcolumn"></span><span class="secondcolumn">from: ${portNameOrFileName} (${sysexArray.length} bytes total)</span>`;
  if (sysexArray[0] == 240) tableContainer.innerHTML = '';
  tableContainer.appendChild(firstRow);

  const secondRow = document.createElement('p');
  addClass(secondRow, 'secondrow');
  secondRow.innerHTML = `<span class="firstcolumn"></span><span class="secondcolumn">01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10</span>`;
  tableContainer.appendChild(secondRow);

  for (let i = 0; i < rowCount; i++) {
    const row = document.createElement('p');
    row.innerHTML = createInnerHtmlHexRow(sysexArray, i);
    tableContainer.appendChild(row);
  }
}
// ##############################################
function createInnerHtmlHexRow(sysexArray, i) {
  // return `<span class="firstcolumn">
  // ${i < 100 ? '&nbsp;' : ''}${i < 10 ? '&nbsp;' : ''}${ i < 1 ? '0' : ''
  // }${i * 10}</span><span class="secondcolumn">${hexStringFromIntArray(
  //   sysexArray.slice(i * 10, i * 10 + 10)
  // )}</span>`;
  return `<span class="firstcolumn">${
    i * 10
  }</span><span class="secondcolumn">${hexStringFromIntArray(
    sysexArray.slice(i * 10, i * 10 + 10)
  )}</span>`;
}
// ##############################################
function hexStringFromIntArray(intArray) {
  return toHex(intArray).join(' | ');
}
// ########################################################
function extractSysex(midiData) {
  const sysexStart = midiData.lastIndexOf(sysex_start_byte);
  const sysexEnd = midiData.indexOf(sysex_end_byte, sysexStart);
  logger.debug('extract Sysex', sysexStart, sysexEnd, sysexStart < sysexEnd);
  if (!(sysexStart < sysexEnd)) return null;

  const sysexData = midiData.slice(sysexStart, sysexEnd + 1);
  logger.debug('extract Sysex', [...sysexData].splice(1, 2).join());
  return sysexData;
}
// ##############################################
function autoSaveSysex() {
  logger.debug('auto Save Sysex');
  midiBay.autoSaveSysex = midiBay.autoSaveSysex ? false : true;
  toggleDisplayClass(document.querySelector('.auto_save_sysex'), 'active', midiBay.autoSaveSysex);
}
// ##############################################
function toHex(intArray) {
  const hexArray = [];
  intArray.map((int, index) => {
    hexArray[index] =
      int.toString(16).length == 1
        ? '0' + int.toString(16).toUpperCase()
        : int.toString(16).toUpperCase();
  });
  return hexArray;
}
// #################################################
Array.prototype.compareSlice = function (array) {
  //console.log('Array compare Slice', this, array);
  let isEqual = true;
  this.forEach((element, index) => {
    if (array[index] !== element) isEqual = false;
  });
  return isEqual;
};

// #############################################''
