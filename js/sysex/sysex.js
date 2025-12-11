export {
  sendCollectedSysexToSysexForm,
  toHex,
  sendSound,
  extractSysex,
  // sendBlofelDumpRequest,
  sendDumpRequest,
  sendInstrumentDumpRequest,
  hexStringFromIntArray,
  autoSaveSysex,
  addDeviceInfoToFileName,
  clearSysexTable,
  showSysexTable,
  collectSysexData,
};

import { blofelDumpRequest, getBlofeldPatchName, getBlofeldPatchCategory } from './BlofelSyntax.js';
import { downloadSysexFile } from '../html/htmlForm.js';
import {
  sendSysexDataToModule,
  getInstrumentNameFromSysexArray,
  resetViewContentButtons,
} from '../sysex/sysexFile.js';
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
  logger.debug(
    `sysex To Message - sysexArray[0]:${midiData[0]},[last]:${
      midiData[midiData.length - 1]
    },[length]:${midiData.length}`
  );

  // if (midiData.length <= 12)
  //   return hexStringFromIntArray(midiData);

  showSysexTable(midiData, port.name);
  resetViewContentButtons();
  if (midiBay.collectingSysEx) return;

  sendSysexDataToModule(midiBay.sysexMessage);

  const fileName = addDeviceInfoToFileName();
  if (getInstrumentFirstPatch(fileName)) return;
  document.getElementById(`sysex_file_rename`).innerText = fileName || 'sysex';

  if (midiBay.autoSaveSysex) downloadSysexFile();
  // if (isNymphesSysex(midiBay.sysexMessage)) extractNymphesSysex();
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
} // ##############################################
function getInstrumentFirstPatch(fileName) {
  logger.debug('get Instrument First Patch', fileName);
  logger.debug('sysex Message', midiBay.sysexMessage);
  const instrumentSysexName = getInstrumentNameFromSysexArray(midiBay.sysexMessage);
  logger.debug('instrument Sysex Name', instrumentSysexName);
  logger.debug('dump Select Value', midiBay.dumpSelect);
  const instrumentDumpName = midiBay.dumpSelect.value.split(' ')[0];
  const singlePatch = midiBay.dumpSelect.value.split(' ')[1];
  if (instrumentSysexName != instrumentDumpName) return false;
  if (singlePatch == 'single') {
    if (fileName == 'Nymphes_USER_A_1') {
      midiBay.firstPatch = [...midiBay.sysexMessage];
      return false;
    } // ToDo!!! nicht Nymphes???
    else {
      midiBay.sysexMessage = [...midiBay.firstPatch];
      return true;
    }
  }
  return false;
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
// ################################################################
function addDeviceInfoToFileName() {
  const sysexMsg = midiBay.sysexMessage;
  logger.debug('add Device Info To File Name', sysexMsg);

  switch (true) {
    case sysexMsg.slice(5, 7).compareSlice([66, 81]):
      return 'Minilogue_XD_';

    case sysexMsg.slice(1, 6).compareSlice([0, 33, 53, 0, 6]):
      logger.debug(
        'add Device Info To File Name 247',
        'Nymphes_' +
          ['USER', 'FACTORY'][sysexMsg[7]] +
          '_' +
          ['-', 'A', 'B', 'C', 'D', 'E', 'F', 'G'][sysexMsg[8]] +
          '_' +
          sysexMsg[9]
      );
      sysexMsg[6] = 0; // todo set Nymphes Patches to temp
      return (
        'Nymphes_' +
        ['USER', 'FACTORY'][sysexMsg[7]] +
        '_' +
        ['-', 'A', 'B', 'C', 'D', 'E', 'F', 'G'][sysexMsg[8]] +
        '_' +
        sysexMsg[9]
      );

    case sysexMsg.slice(1, 3).compareSlice([62, 19]):
      return 'Blofeld_' + getBlofeldPatchCategory(sysexMsg) + '_' + getBlofeldPatchName(sysexMsg);
  }
  logger.debug('add Device Info To File Name (null)');
  return null;
}
// ################################################################
function sendDumpRequest(eClick) {
  eClick.preventDefault();
  eClick.stopPropagation();
  sendInstrumentDumpRequest(midiBay.dumpSelect.value);
}
// ################################################################
function sendInstrumentDumpRequest(dumpSelectValue) {
  const instrumentName = dumpSelectValue.split(' ')[0];
  const dumpRequestObj = midiBay.dumpRequestObj[instrumentName];
  logger.debug('sendInstrumentDumpRequest', dumpRequestObj.defaultport, dumpRequestObj.request);
  if (midiBay.outNameMap.get(dumpRequestObj.defaultport)) {
    midiBay.outNameMap.get(dumpRequestObj.defaultport).send(dumpRequestObj.request);
    return;
  }
  if (midiBay.selectedPort?.type == 'output') {
    midiBay.selectedPort.send(dumpRequestObj.request);
  }
}
// #############################################''
// function sendBlofelDumpRequest(eClick) {
//   console.log('send Blofel Dump Request', midiBay.outNameMap.get('Blofeld'), blofelDumpRequest);
//   eClick.preventDefault();
//   eClick.stopPropagation();
//   midiBay.outNameMap.get('Blofeld')?.send(blofelDumpRequest);
// }
// #############################################''
function sendSound(sound, category) {
  logger.debug('send Sound');

  const fileName = category + '.' + sound + '.mid';
  midiOuts['Blofeld']?.send(soundMap.get(fileName).data);
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
// #################################################
function isNymphesSysex(sysexMsg) {
  return sysexMsg.slice(1, 6).compareSlice([0, 33, 53, 0, 6]);
}
// // #################################################
function extractNymphesSysex() {
  const crc = midiBay.sysexMessage.slice(10, 12);
  const sysexArray = midiBay.sysexMessage.slice(12, midiBay.sysexMessage.length - 1);
  logger.debug('extractNymphesSysex', crc, sysexArray);
  let aNibble = null;
  let deNibbledArray = [];
  // sysexArray.forEach((byte) => {
  for (let i = 0; i < sysexArray.length; i++) {
    if (aNibble === null) {
      aNibble = sysexArray[i];
      continue;
    }
    deNibbledArray.push(aNibble + sysexArray[i] * 16);
    aNibble = null;
  }
  logger.debug('extract Nymphes Sysex', deNibbledArray.length, deNibbledArray);
}
// // #################################################
// function fillSoundMap(thisFile, dataArray, sysexArray) {
//  console.log('fill SoundMap');

//   const fileName = thisFile.name;
//   if (!soundMap.has(fileName)) {
//     soundMap.set(fileName, {
//       // cat: thisFile.name.slice(0, fileName.indexOf('.')),
//       // soundname: fileName.slice(fileName.indexOf('.') + 1, fileName.lastIndexOf('.')),
//       data: dataArray,
//       sysex: sysexArray,
//     });
//   }
//console.log('fill SoundMap', soundMap);
// }
// #############################################''
// function readTextFile(fileName) {
//   const file = fileUrl + fileName;
//   var rawFile = new XMLHttpRequest();
//   rawFile.open('GET', file, false);
//   rawFile.onreadystatechange = function () {
//     if (rawFile.readyState === 4) {
//       if (rawFile.status === 200 || rawFile.status == 0) {
//         var allText = rawFile.responseText;
//        console.log(allText);
//       }
//     }
//   };
//   rawFile.send(null);
// }
