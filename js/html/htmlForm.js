export { getFiles, showDumpButton, downloadSettingsFile, downloadSysexFile };
import { midiBay } from '../main.js';
// import {  } from '../sysex/sysex.js';
import { getSysexFileToMap, sysexToSyxFileUrl } from '../sysex/sysexFile.js';
import { loadJsonFileToStorage, storageToJson, getStorage } from '../storage/storage.js';
import { logger } from '../utils/logger.js';
import { hide, show } from './domStyles.js';

// #################################################
function getFiles(eFiles) {
  logger.debug('getFiles', eFiles.target.id);
  const fileArray = eFiles.target.files;
  for (let fileNr = 0; fileNr < fileArray.length; fileNr++) {
    const file = fileArray[fileNr];
    if (file.name.endsWith('.json')) loadJsonFileToStorage(file);
    else if (file.name.match(/(.mid\b|.syx\b)/i)) getSysexFileToMap(file);
  }
  document.getElementById('form_settings').reset();
  logger.debug('getFiles complete', fileArray.length, 'files');
}
// ########################################################
function downloadSysexFile() {
  logger.debug('downloadSysexFile');

  if (!midiBay.sysexMessage) return;

  const fileName = document.getElementById(`sysex_file_rename`).innerText || 'sysex';
  logger.debug('downloadSysexFile filename', fileName);
  const fileDownloadTag = document.createElement('a');
  // const fileDownloadTag = document.getElementById(`settings_file_download`);
  // fileDownloadTag.href = `data:audio/midi;base64, ${downloadString}`;
  // fileDownloadTag.href = `application/octet-stream, ${downloadString}`;
  fileDownloadTag.href = sysexToSyxFileUrl(midiBay.sysexMessage);
  // fileDownloadTag.download = fileRenameTag.innerText + '.syx' || syxFileName;
  fileDownloadTag.download = fileName + '.syx';
  // fileDownloadTag.innerText = 'Download Settings';
  // fileDownloadTag.setAttribute('visibility', 'visible');

  // fileRenameTag.innerText = filename.replace('.json', '');
  // fileRenameTag.style.display = 'inline-block';
  // fileDownloadTag.visibility = 'visible';
  hide(fileDownloadTag);
  fileDownloadTag.click();
  fileDownloadTag.remove();
  document.getElementById('form_sysex').reset();
}
// ########################################################
function downloadSettingsFile() {
  logger.debug('download Settings File');

  const jsonFileName = 'WMB_Storage.json';
  const fileRenameTag = document.getElementById(`settings_file_rename`);
  const fileDownloadTag = document.createElement('a');
  fileDownloadTag.href = `data:application/json, ${storageToJson()}`;
  fileDownloadTag.download = fileRenameTag.innerText + '.json' || jsonFileName;
  // fileDownloadTag.innerText = 'Download Settings';
  // fileDownloadTag.setAttribute('visibility', 'visible');
  hide(fileDownloadTag);
  fileDownloadTag.click();
  fileDownloadTag.remove();
  document.getElementById('form_settings').reset();
}
// #################################################
function showDumpButton() {
  logger.debug('showDumpButton');

  const dumpTag = document.querySelector('.sysex.dumprequest');
  midiBay.dumpRequestObj = getStorage('WMB_midi_dump_requests');
  midiBay.dumpSelect = document.getElementById('dumprequest');
  if (!midiBay.dumpRequestObj) return hide(dumpTag);
  for (const [key, value] of Object.entries(midiBay.dumpRequestObj)) {
    const optionElement = document.createElement('option');
    optionElement.setAttribute('value', key);
    const textNode = document.createTextNode(value.info);
    optionElement.appendChild(textNode);
    midiBay.dumpSelect.appendChild(optionElement);
  }
}
// ########################################################
// EOF
