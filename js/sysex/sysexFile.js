export {
  getSysexFileToMap,
  sysexToSyxFile,
  sysexToSyxFileUrl,
  listSysexFilesToSendList,
  resetViewContentButtons,
};
import { extractSysex, clearSysexTable, showSysexTable } from './sysex.js';
import { logger } from '../utils/logger.js';
import { addClass } from '../html/domStyles.js';
import { midiBay, soundMap } from '../main.js';
import { MIDI_SYSEX_START, MIDI_SYSEX_END } from '../constants/midiConstants.js';

// ################################################################
function safeSysexAsFile(sysexData) {
  logger.debug('safe Blofeld SoundDump As File ');

  const fileName = document.getElementById('file_rename').innerText;
  createSoundDownloadTag(fileName, sysexToSyxFile(sysexData));
}
// ##############################################################
function sysexToSyxFileUrl(sysexData) {
  logger.debug('sysex To Syx File Url', sysexData.length);

  const fileBuffer = new ArrayBuffer(sysexData.length);
  const uInt8ArrayView = new Uint8Array(fileBuffer);

  sysexData.map((item, i) => {
    uInt8ArrayView[i] = item;
  });
  var blob = new Blob([uInt8ArrayView], { type: 'application/octet-stream' });
  return window.URL.createObjectURL(blob);
}
// ##############################################################
function sysexToSyxFile(sysexData) {
  logger.debug('sysex To MidFile');

  logger.debug(sysexData, sysexData.length);
  const fileBuffer = new ArrayBuffer(sysexData.length);
  const uInt8ArrayView = new Uint8Array(fileBuffer);

  sysexData.forEach((item, i) => {
    uInt8ArrayView[i] = item;
  });
  // Use chunked processing to avoid stack overflow with large arrays
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uInt8ArrayView.length; i += chunkSize) {
    const chunk = uInt8ArrayView.subarray(i, Math.min(i + chunkSize, uInt8ArrayView.length));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}
// getSysexFilesToMap #########################################################################

function getSysexFilesToMap(eFiles) {
  logger.debug('get Sysex Files', eFiles.target.files);

  for (const file of eFiles.target.files) {
    if (!file.name.match(/(.mid\b|.syx\b)/i)) continue;

    const reader = new FileReader();
    reader.onload = () => extractSysexFileToMap(file, reader.result);
    reader.readAsArrayBuffer(file);
  }
}
// getSysexFileToMap #########################################################################
function getSysexFileToMap(file) {
  const reader = new FileReader();
  reader.onload = () => extractSysexFileToMap(file, reader.result);
  reader.readAsArrayBuffer(file);
}
// #################################################
function extractSysexFileToMap(file, byteBlock) {
  logger.debug('extract Sysex File To Map');

  const uInt8ArrayView = new Uint8Array(byteBlock);
  const sysexData = extractSysex(Array.from(uInt8ArrayView));
  if (sysexData && !midiBay.sysexFileMap.has(file.name)) {
    midiBay.sysexFileMap.set(file.name, sysexData);
  }
  listSysexFilesToSendList();
}
// ##############################################
function listSysexFilesToSendList() {
  logger.debug('list Sysex Files To Send List', midiBay.sysexFileMap);
  if (!midiBay.sysexFileMap) return;

  clearSysexTable();
  addUploadedFilesHeadTag();

  midiBay.sysexFileMap.forEach((fileData, fileName) => {
    addSysexFileTag(fileName);
  });
}
// ##############################################
function addUploadedFilesHeadTag() {
  logger.debug('add Uploaded Files Head Tag');
  const fileTag = document.createElement('h3');
  addClass(fileTag, 'sysexfile_head');
  fileTag.innerHTML = `Click filename to send Sysex to selected MIDI Output:`;
  document.querySelector('div.sysex').appendChild(fileTag);
}
// ##############################################
function addSysexFileTag(fileName) {
  const fileTag = document.createElement('p');
  fileTag.classList.add('sysexfile');
  fileTag.innerHTML =
    `<span class="filename" data-filename="${fileName}">${fileName}</span>` +
    `<span class="filesize" data-filename="${fileName}"> (${
      midiBay.sysexFileMap.get(fileName).length
    } bytes)</span>` +
    `<span class="view_content" data-filename="${fileName}">view content</span>`;

  document.querySelector('div.sysex').appendChild(fileTag);

  const filenameSpan = fileTag.querySelector('.filename');
  filenameSpan.addEventListener('click', sendSysexFileData);

  const viewContentSpan = fileTag.querySelector('.view_content');
  viewContentSpan.addEventListener('click', showSysexFileContent);
}
// ##############################################
function sendSysexFileData(eClick) {
  eClick.preventDefault();
  eClick.stopPropagation();
  const filename = eClick.target.dataset.filename;
  const sysexArray = midiBay.sysexFileMap.get(filename);
  sendSysexFileDataToSelectedOutput(sysexArray);
}
// ##############################################
function showSysexFileContent(eClick) {
  eClick.preventDefault();
  eClick.stopPropagation();

  const tableContainer = document.getElementById('sysex_table_container');

  // Toggle: If table is visible, hide it
  if (tableContainer && eClick.target.textContent === 'hide content') {
    tableContainer.innerHTML = '';
    eClick.target.textContent = 'view content';
    return;
  }

  // Display table
  const filename = eClick.target.dataset.filename;
  const sysexArray = midiBay.sysexFileMap.get(filename);
  logger.debug('showSysexFileContent', filename, sysexArray);
  logger.debug(`File: ${filename} (${sysexArray.length} bytes)`, sysexArray);

  showSysexTable(sysexArray, filename);

  // Alle anderen 'view_content' spans auf 'view content' zurücksetzen
  resetViewContentButtons();
  eClick.target.textContent = 'hide content';
}
// ##############################################
function resetViewContentButtons() {
  document.querySelectorAll('.view_content').forEach((span) => {
    span.textContent = 'view content';
  });
}

// ##############################################
function sendSysexFileDataToSelectedOutput(sysexArray) {
  logger.debug('send Sysex File Data To Selected Output');
  if (!midiBay.selectedPort || midiBay.selectedPort.type === 'input') return;

  try {
    if (midiBay.selectedPort.state === 'connected') {
      midiBay.selectedPort.send(sysexArray);
      logger.debug('SysEx sent successfully to', midiBay.selectedPort.name);
    } else {
      logger.warn(
        `Cannot send SysEx: Port ${midiBay.selectedPort.name} is ${midiBay.selectedPort.state}`
      );
    }
  } catch (error) {
    logger.error(`Error sending SysEx to ${midiBay.selectedPort.name}:`, error.message);
  }
}
// ##############################################################
// function sysexToMidFile(sysexData) {
//   console.log('sysex To MidFile', sysexData);

//   //console.log(sysexData.join(','));
//   const sysexFileData = [...sysexData];
//   sysexFileData.shift();
//   const sysexFileArray = sysexFileHead.concat(sysexFileData, sysexFileTail);
//   //console.log(sysexFileArray);
//   const fileBuffer = new ArrayBuffer(sysexFileArray.length);
//   const uInt8ArrayView = new Uint8Array(fileBuffer);

//   sysexFileArray.map((item, i) => {
//     uInt8ArrayView[i] = item;
//   });
//   return btoa(String.fromCharCode(...uInt8ArrayView));
//   //console.log(downloadString);
// }
// ##############################################################
// EOF
