export { getFiles, showDumpButton, downloadSettingsFile, downloadSysexFile };
import { midiBay } from '../main.js';
import { loadSysexFile } from '../sysex/sysexFileUpload.js';
import { listSysexFilesToSendListAction } from '../sysex/sysexFileActions.js';
import { sysexToSyxFileUrl } from '../sysex/sysexFormat.js';
import { loadJsonFileToStorage, storageToJson, getStorage } from '../storage/storage.js';
import { logger } from '../utils/logger.js';
import { hide } from './domUtils.js';
import { sanitizeFilename } from '../utils/helpers.js';
import { sendTemporaryTextToTag } from '../ports/portInteraction.js';

// #################################################
function getFiles(eFiles) {
  logger.debug('getFiles', eFiles.target.id);
  const fileArray = eFiles.target.files;
  for (let fileNr = 0; fileNr < fileArray.length; fileNr++) {
    const file = fileArray[fileNr];
    if (file.name.endsWith('.json')) loadJsonFileToStorage(file);
    else if (file.name.match(/(.mid\b|.syx\b)/i))
      loadSysexFile(file, listSysexFilesToSendListAction);
  }
  document.getElementById('form_settings').reset();
  logger.debug('getFiles complete', fileArray.length, 'files');
}
// ########################################################
function downloadSysexFile() {
  logger.debug('downloadSysexFile');

  if (!midiBay.sysexMessage || midiBay.sysexMessage.length === 0) {
    const downloadButtonTag = document.querySelector(`.sysex_file_download`);
    sendTemporaryTextToTag(downloadButtonTag, 'No data available', 'warning');
    return;
  }

  const rawFileName = document.getElementById(`sysex_file_rename`).innerText || 'sysex';
  const fileName = sanitizeFilename(rawFileName) + '.syx';
  logger.debug('downloadSysexFile filename', fileName);
  const fileDownloadTag = document.createElement('a');
  // const fileDownloadTag = document.getElementById(`settings_file_download`);
  // fileDownloadTag.href = `data:audio/midi;base64, ${downloadString}`;
  // fileDownloadTag.href = `application/octet-stream, ${downloadString}`;
  fileDownloadTag.href = sysexToSyxFileUrl(midiBay.sysexMessage);
  // fileDownloadTag.download = fileRenameTag.innerText + '.syx' || syxFileName;
  fileDownloadTag.download = fileName;
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

  const fileRenameTag = document.getElementById(`settings_file_rename`);
  const rawFileName = fileRenameTag.innerText || 'WMB_Storage';
  const fileName = sanitizeFilename(rawFileName);
  const fileDownloadTag = document.createElement('a');
  fileDownloadTag.href = `data:application/json, ${storageToJson()}`;
  fileDownloadTag.download = fileName + '.json';
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
