/**
 * sysexFileListUI.js - SysEx File List UI Rendering
 *
 * Handles visualization of uploaded SysEx files:
 * - File list rendering with event handler callbacks
 * - Content viewing toggle
 * - List cleanup
 *
 * Event handlers are passed as parameters from sysexFileActions.js orchestrator
 */

export {
  addClearFileListButton,
  resetViewContentButtons,
  addUploadedFilesHeadTag,
  addSysexFileTag,
};

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { addClass } from '../html/domUtils.js';
import { setText } from '../html/domContent.js';

// ##############################################
/**
 * Adds clear button to remove all files from list.
 * @param {Function} onClearCallback - Callback for clear button click
 */
function addClearFileListButton(onClearCallback) {
  const buttonTag = document.createElement('p');
  addClass(buttonTag, 'sysexfile');

  const clearSpan = document.createElement('span');
  addClass(clearSpan, 'clear_filelist');
  addClass(clearSpan, 'form_buttons');
  setText(clearSpan, 'clear list');
  buttonTag.appendChild(clearSpan);

  document.querySelector('div.sysex').appendChild(buttonTag);
  // Lokaler Listener, da nur für diesen Button gültig
  clearSpan.addEventListener('click', onClearCallback);
}

// ##############################################
/**
 * Resets all "view content" buttons to default state.
 */
function resetViewContentButtons() {
  document.querySelectorAll('.view_content').forEach((span) => {
    setText(span, 'view content');
  });
}

// ##############################################
/**
 * Adds heading tag above file list.
 */
function addUploadedFilesHeadTag() {
  logger.debug('add Uploaded Files Head Tag');
  const fileTag = document.createElement('h3');
  addClass(fileTag, 'sysexfile_head');
  setText(fileTag, 'Click filename to send SysEx to selected MIDI Output:');
  document.querySelector('div.sysex').appendChild(fileTag);
}

// ##############################################
/**
 * Adds file tag with filename, size, and view button.
 * Event handlers are passed as callbacks from orchestrator.
 * @param {string} fileName - Name of the SysEx file
 * @param {Function} onClickHandler - Handler for filename click
 * @param {Function} onViewHandler - Handler for "view content" button click
 */
function addSysexFileTag(fileName, onClickHandler, onViewHandler) {
  const fileTag = document.createElement('p');
  addClass(fileTag, 'sysexfile');

  const filenameSpan = document.createElement('span');
  addClass(filenameSpan, 'filename');
  filenameSpan.dataset.filename = fileName;
  setText(filenameSpan, fileName);

  const sizeSpan = document.createElement('span');
  addClass(sizeSpan, 'filesize');
  sizeSpan.dataset.filename = fileName;
  setText(sizeSpan, ` (${midiBay.sysexFileMap.get(fileName).length} bytes)`);

  const viewContentButton = document.createElement('span');
  addClass(viewContentButton, 'view_content');
  viewContentButton.dataset.filename = fileName;
  setText(viewContentButton, 'view content');

  fileTag.append(filenameSpan, sizeSpan, viewContentButton);
  document.querySelector('div.sysex').appendChild(fileTag);

  // Lokale Listener pro Eintrag (werden mit Element entfernt)
  if (onClickHandler) filenameSpan.addEventListener('click', onClickHandler);
  if (onViewHandler) viewContentButton.addEventListener('click', onViewHandler);
}
