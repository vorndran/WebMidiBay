/**
 * sysexFileUpload.js - SysEx File Upload & Storage
 *
 * Handles file input processing and storage in Map.
 * Pure data processing without UI rendering.
 */

export { loadSysexFile };

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { MIDI_SYSEX_START, MIDI_SYSEX_END } from '../constants/midiConstants.js';

// ##############################################
/**
 * Orchestrates SysEx file loading and UI update.
 * @param {File} file - File object from input
 * @param {Function} onComplete - Callback after file is loaded
 */
function loadSysexFile(file, onComplete) {
  const reader = new FileReader();
  reader.onload = () => {
    extractSysexFileToMap(file, reader.result);
    if (onComplete) onComplete();
  };
  reader.readAsArrayBuffer(file);
}

// ##############################################
/**
 * Extracts SysEx data from file and stores in Map.
 * Enforces 1MB size limit.
 * @param {File} file - File object
 * @param {ArrayBuffer} byteBlock - File content as ArrayBuffer
 */
function extractSysexFileToMap(file, byteBlock) {
  logger.debug('extract Sysex File To Map');

  // Hard limit: 1 MB
  const MAX_SYSEX_SIZE = 1024 * 1024;
  if (byteBlock.byteLength > MAX_SYSEX_SIZE) {
    logger.warn(
      `SysEx file "${file.name}" exceeds maximum size of 1 MB (${byteBlock.byteLength} bytes) - skipped`
    );
    return;
  }

  const uInt8ArrayView = new Uint8Array(byteBlock);
  const sysexData = extractSysex(Array.from(uInt8ArrayView));
  if (sysexData && !midiBay.sysexFileMap.has(file.name)) {
    midiBay.sysexFileMap.set(file.name, sysexData);
  }
}
// ##############################################
/**
 * Extracts complete SysEx message from a MIDI data array.
 * Searches for Start (0xF0) and End (0xF7) bytes.
 * @param {Array<number>} midiData - Complete MIDI data array
 * @returns {Array<number>|null} Extracted SysEx data or null if invalid
 */
function extractSysex(midiData) {
  const sysexStart = midiData.lastIndexOf(MIDI_SYSEX_START);
  const sysexEnd = midiData.indexOf(MIDI_SYSEX_END, sysexStart);

  logger.debug('extract Sysex', sysexStart, sysexEnd, sysexStart < sysexEnd);

  if (!(sysexStart < sysexEnd)) return null;

  const sysexData = midiData.slice(sysexStart, sysexEnd + 1);
  logger.debug('extract Sysex', [...sysexData].splice(1, 2).join());

  return sysexData;
}
