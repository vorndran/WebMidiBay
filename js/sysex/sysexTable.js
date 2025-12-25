/**
 * sysexDisplay.js - SysEx Table UI Rendering
 *
 * Handles visualization of SysEx data in HTML table format.
 * Displays hex values in 10-byte rows with headers.
 */

export { clearSysexTable, showSysexTable };

import { logger } from '../utils/logger.js';
import { addClass } from '../html/domUtils.js';
import { setText, clearInnerHTML } from '../html/domContent.js';
import { MIDI_SYSEX_START } from '../constants/midiConstants.js';
import { hexStringFromIntArray } from './sysexFormat.js';
// ##############################################
/**
 * Clears all dynamically created SysEx display content.
 * Removes file list, table, and preserves only static container.
 */
function clearSysexTable() {
  const sysexContainer = document.querySelector('div.sysex');

  // Remove file list heading
  const fileHead = sysexContainer.querySelector('.sysexfile_head');
  if (fileHead) fileHead.remove();

  // Remove all file entries
  sysexContainer.querySelectorAll('.sysexfile').forEach((el) => el.remove());

  // Remove sysex table container
  const tableContainer = document.getElementById('sysex_table_container');
  if (tableContainer) tableContainer.remove();
}

// ##############################################
/**
 * Displays SysEx data in a formatted HTML table.
 * Orchestrates table creation with header and data rows.
 * @param {Array<number>} sysexArray - SysEx data to display
 * @param {string} portNameOrFileName - Source identifier for header
 */
function showSysexTable(sysexArray, portNameOrFileName) {
  logger.debug('show Sysex Table');

  const tableContainer = getOrCreateTableContainer();

  // Clear existing content if new SysEx message starts
  if (sysexArray[0] === MIDI_SYSEX_START) clearInnerHTML(tableContainer);

  appendHeaderRow(tableContainer, portNameOrFileName, sysexArray.length);
  appendColumnHeaders(tableContainer);
  appendDataRows(tableContainer, sysexArray);
}

// ##############################################
/**
 * Gets existing or creates new table container element.
 * Container preserves file list while displaying table.
 * @returns {HTMLElement} Table container element
 */
function getOrCreateTableContainer() {
  const sysexTag = document.querySelector('div.sysex');
  let tableContainer = document.getElementById('sysex_table_container');

  if (!tableContainer) {
    tableContainer = document.createElement('div');
    tableContainer.id = 'sysex_table_container';
    addClass(tableContainer, 'sysex_table');
    sysexTag.appendChild(tableContainer);
  }

  return tableContainer;
}

// ##############################################
/**
 * Appends header row with source info and byte count.
 * @param {HTMLElement} tableContainer - Target container
 * @param {string} portNameOrFileName - Source identifier
 * @param {number} byteCount - Total bytes in SysEx message
 */
function appendHeaderRow(tableContainer, portNameOrFileName, byteCount) {
  const firstRow = document.createElement('p');
  addClass(firstRow, 'firstrow');
  const firstColumn = document.createElement('span');
  addClass(firstColumn, 'firstcolumn');
  setText(firstColumn, '');

  const secondColumn = document.createElement('span');
  addClass(secondColumn, 'secondcolumn');
  setText(secondColumn, `from: ${portNameOrFileName} (${byteCount} bytes total)`);

  firstRow.append(firstColumn, secondColumn);
  tableContainer.appendChild(firstRow);
}

// ##############################################
/**
 * Appends column header row with byte position labels (01-10).
 * @param {HTMLElement} tableContainer - Target container
 */
function appendColumnHeaders(tableContainer) {
  const secondRow = document.createElement('p');
  addClass(secondRow, 'secondrow');
  const firstColumn = document.createElement('span');
  addClass(firstColumn, 'firstcolumn');
  setText(firstColumn, '');

  const secondColumn = document.createElement('span');
  addClass(secondColumn, 'secondcolumn');
  setText(secondColumn, '01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10');

  secondRow.append(firstColumn, secondColumn);
  tableContainer.appendChild(secondRow);
}

// ##############################################
/**
 * Appends all data rows to table (10 bytes per row).
 * @param {HTMLElement} tableContainer - Target container
 * @param {Array<number>} sysexArray - SysEx data
 */
function appendDataRows(tableContainer, sysexArray) {
  const rowCount = Math.ceil(sysexArray.length / 10);
  for (let i = 0; i < rowCount; i++) {
    const row = createHexRow(sysexArray, i);
    tableContainer.appendChild(row);
  }
}

// ##############################################
/**
 * Creates a single hex data row element.
 * @param {Array<number>} sysexArray - SysEx data
 * @param {number} rowIndex - Row index (0-based)
 * @returns {HTMLElement} Row element
 */
function createHexRow(sysexArray, rowIndex) {
  const row = document.createElement('p');
  const firstColumn = document.createElement('span');
  addClass(firstColumn, 'firstcolumn');
  setText(firstColumn, rowIndex * 10);

  const secondColumn = document.createElement('span');
  addClass(secondColumn, 'secondcolumn');
  setText(secondColumn, hexStringFromIntArray(sysexArray.slice(rowIndex * 10, rowIndex * 10 + 10)));

  row.append(firstColumn, secondColumn);
  return row;
}
