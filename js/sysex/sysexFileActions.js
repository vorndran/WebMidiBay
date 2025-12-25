/**
 * sysexFileActions.js - Orchestrator für File List & MIDI Actions
 *
 * Verbindet UI-Rendering (sysexFileListUI) mit MIDI-Output (sysexSendAndToggles)
 * ohne circular dependency. Alle Actions die beide Module benötigen.
 */

export {
  listSysexFilesToSendListAction,
  toggleAutoCollectSysexAction,
  toggleAutoDownloadSysexAction,
  sendCollectedSysexToSysexFormAction,
};

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { preventAndStop } from '../html/domUtils.js';
import { setText } from '../html/domContent.js';
import { updateLayout } from '../html/htmlUpdater.js';
import { downloadSysexFile } from '../html/htmlForm.js';
import { showSysexTable, clearSysexTable } from './sysexTable.js';
import {
  addUploadedFilesHeadTag,
  addClearFileListButton,
  addSysexFileTag,
  resetViewContentButtons,
} from './sysexFileListUI.js';
import { sendSysexFileDataToSelectedOutput } from './sysexSendAndToggles.js';
import { toggleClass } from '../html/domUtils.js';

// ##############################################
/**
 * Action: Render uploaded file list with event handlers
 * Orchestrates file list rendering, disables auto-collection if active
 */
function listSysexFilesToSendListAction() {
  logger.debug('list Sysex Files To Send List', midiBay.sysexFileMap);

  // Disable auto-collection if active
  if (midiBay.autoCollectSysex) {
    toggleAutoCollectSysexAction();
    if (midiBay.autoDownloadSysex) toggleAutoDownloadSysexAction();
  } else {
    clearSysexTable();
  }

  // Render file list header
  addUploadedFilesHeadTag();

  // Render each file tag with event handlers
  midiBay.sysexFileMap.forEach((fileData, fileName) => {
    addSysexFileTag(fileName, sendSysexFileDataAction, showSysexFileContentAction);
  });

  // Add clear button if files exist
  if (midiBay.sysexFileMap.size > 0) {
    addClearFileListButton(clearSysexFileList);
  }
}

// ##############################################
/**
 * Action: Send SysEx file to MIDI output
 * Combines file retrieval (UI) with MIDI sending (Send)
 */
function sendSysexFileDataAction(eClick) {
  if (eClick) preventAndStop(eClick);

  const filename = eClick.target.dataset.filename;
  const sysexArray = midiBay.sysexFileMap.get(filename);
  sendSysexFileDataToSelectedOutput(sysexArray);
}

// ##############################################
/**
 * Action: Show file content with view button management
 * Combines table display with UI button state management
 */
function showSysexFileContentAction(eClick) {
  if (eClick) preventAndStop(eClick);

  const tableContainer = document.getElementById('sysex_table_container');

  // Toggle: If table is visible, hide it
  if (tableContainer && eClick.target.textContent === 'hide content') {
    tableContainer.innerHTML = '';
    midiBay.sysexMessage = [];
    setText(eClick.target, 'view content');
    return;
  }

  // Display table
  const filename = eClick.target.dataset.filename;
  const sysexArray = midiBay.sysexFileMap.get(filename);
  logger.debug('showSysexFileContent', filename, sysexArray);
  logger.debug(`File: ${filename} (${sysexArray.length} bytes)`, sysexArray);

  midiBay.sysexMessage = sysexArray;
  showSysexTable(sysexArray, filename);

  resetViewContentButtons();
  setText(eClick.target, 'hide content');
}

// ##############################################
/**
 * Action: Toggle auto-collection with file list cleanup
 * Combines toggle state with UI list management
 */
function toggleAutoCollectSysexAction() {
  midiBay.autoCollectSysex = !midiBay.autoCollectSysex;
  const toggleButton = document.querySelector('.toggle_sysex_collection');
  toggleClass(toggleButton, 'active', midiBay.autoCollectSysex);
  logger.info(`SysEx Auto-Collection: ${midiBay.autoCollectSysex ? 'ON' : 'OFF'}`);

  midiBay.sysexMessage = [];
  if (midiBay.autoCollectSysex) {
    clearSysexFileList();
  } else {
    if (midiBay.autoDownloadSysex) toggleAutoDownloadSysexAction();
    clearSysexTable();
  }
}

// ##############################################
/**
 * Action: Toggle auto-download with auto-collection dependency
 */
function toggleAutoDownloadSysexAction(eClick) {
  if (eClick) preventAndStop(eClick);

  logger.debug('auto Download Sysex');
  midiBay.autoDownloadSysex = !midiBay.autoDownloadSysex;
  const toggleButton = document.querySelector('.auto_download_sysex');
  toggleClass(toggleButton, 'active', midiBay.autoDownloadSysex);

  if (midiBay.autoDownloadSysex && !midiBay.autoCollectSysex) {
    toggleAutoCollectSysexAction();
  }
}

// ##############################################
/**
 * Action: Bridge between live MIDI collection and display
 * Combines table display with view button reset
 */
function sendCollectedSysexToSysexFormAction(midiData, port) {
  logger.debug('sysex To Message');

  showSysexTable(midiData, port.name);
  resetViewContentButtons();

  if (midiBay.collectingSysEx) return;

  if (midiBay.autoDownloadSysex) downloadSysexFile();
}

// ##############################################
/**
 * Clears file list and map.
 * @param {Event} event - Optional event object
 */
function clearSysexFileList(event) {
  if (event) preventAndStop(event);

  logger.debug('clear Sysex File List');
  midiBay.sysexFileMap.clear();
  clearSysexTable();
}
