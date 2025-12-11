export { getFiles, showDumpButton, downloadSettingsFile, downloadSysexFile };
import {
  blofelDumpRequest,
  microfreakDumpRequest,
  minilogueDumpRequest,
  soundCategories,
} from '../sysex/BlofelSyntax.js';
import { midiBay, soundMap } from '../main.js';
// import {  } from '../sysex/sysex.js';
import { getSysexFileToMap, sysexToSyxFileUrl } from '../sysex/sysexFile.js';
import { loadJsonFileToStorage, storageToJson, getStorage } from '../storage/storage.js';
import { readModuleSettingsFromStorage } from '../modules/moduleStorage.js';
import { logger } from '../utils/logger.js';
import { hide, show } from './domStyles.js';
import { setText } from './domContent.js';

//
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
  // showBlofeldDumpButton();
  // showMinilogueDumpButton();
  // showMicrofreakDumpButton();
  // midiBay.dumpRequestObj = {
  //   name: 'WMB_dumprequests',
  //   blofeld: { info: 'Waldorf Blofeld', defaultport: 'Blofeld', request: [240, 62, 19, 0, 0, 127, 0, 127, 247] },
  //   nymphes: { info: 'Dreadbox Nymphes', defaultport: 'Nymphes', request: [240, 0, 33, 53, 0, 6, 2, 247] },
  //   miniloguexd: { info: 'Korg Minilogue XD', defaultport: 'Minilogue XD', request: [240, 66, 63, 0, 1, 81, 16, 247] },
  //   miniloguexd1: { info: 'Korg Minilogue XD', defaultport: 'Minilogue XD', request: [240, 66, 48, 0, 1, 44, 16, 247] },
  //   minilogue: { info: 'Korg Minilogue', defaultport: 'Minilogue', request: [240, 66, 48, 0, 1, 81, 16, 247] },
  // };
}
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

  // fileRenameTag.innerText = filename.replace('.json', '');
  // fileRenameTag.style.display = 'inline-block';
  // fileDownloadTag.visibility = 'visible';
  hide(fileDownloadTag);
  fileDownloadTag.click();
  fileDownloadTag.remove();
  document.getElementById('form_settings').reset();
}
// ########################################################
// function createDownloadTags(filename, mimeType, downloadString, filePrefix) {
//   logger.debug('createDownloadTags', filename);

//   const fileDownloadTag = document.getElementById(`${filePrefix}file_download`);
//   fileDownloadTag.href = `${mimeType},${downloadString}`;
//   fileDownloadTag.download = filename;
//   setText(fileDownloadTag, 'Download Settings');
//   fileDownloadTag.setAttribute('visibility', 'visible');

//   const fileRenameTag = document.getElementById(`${filePrefix}file_rename`);
//   setText(fileRenameTag, filename.replace('.json', ''));
//   show(fileRenameTag);
// fileDownloadTag.visibility = 'visible';
// fileDownloadTag.style.display = 'none';
// fileDownloadTag.click();
// document.getElementById('form').appendChild(aTag);
// }
// ########################################################
// function removeDownloadTags(filePrefix) {
//   const fileDownloadTag = document.getElementById(`${filePrefix}file_download`);
//   if (!fileDownloadTag?.innerText) return;
//   setText(fileDownloadTag, '');
//   fileDownloadTag.setAttribute('visibility', 'hidden');
//   const fileRenameTag = document.getElementById(`${filePrefix}file_rename`);
//   hide(fileRenameTag);
//   setText(fileRenameTag, '');
//   form.reset()
// }

// #################################################
function showBlofeldDumpButton() {
  document.getElementById('blodump')?.addEventListener('click', () => {
    midiBay.outNameMap.get('Blofeld')?.send(blofelDumpRequest);
  });
  // midiBay.outNameMap.get('Blofeld').close();
  // }
}
// #################################################
function showMinilogueDumpButton() {
  document.getElementById('minidump')?.addEventListener('click', () => {
    midiBay.outNameMap.get('minilogue xd 1 SOUND')?.send(minilogueDumpRequest);
    // midiBay.outNameMap.get('LoopBe Internal MIDI').send(minilogueDumpRequest);
  });
  // midiBay.outNameMap.get('Blofeld').close();
  // }
}
// #################################################
function showMicrofreakDumpButton() {
  document.getElementById('microdump')?.addEventListener('click', () => {
    midiBay.outNameMap.get('Arturia MicroFreak')?.send(microfreakDumpRequest);
    // midiBay.outNameMap.get('LoopBe Internal MIDI').send(minilogueDumpRequest);
  });
  // midiBay.outNameMap.get('Blofeld').close();
  // }
  //console.log(microfreakDumpRequest);
}
