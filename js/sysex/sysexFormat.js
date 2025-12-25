/**
 * sysexFormat.js - SysEx Formatting & Conversion Utilities
 *
 * Handles conversion between different data formats:
 * - Integer arrays to Hex strings
 * - HTML formatting for display
 * - Binary file format conversion (Base64, Blob URLs)
 */

export { toHex, hexStringFromIntArray, sysexToSyxFileUrl };

import { logger } from '../utils/logger.js';

// ##############################################
/**
 * Converts integer array to formatted hex string for display.
 * Hex values are joined with " | " separator.
 * @param {Array<number>} intArray - Array of integer values
 * @returns {string} Formatted hex string (e.g., "F0 | 43 | 10 | F7")
 */
function hexStringFromIntArray(intArray) {
  return toHex(intArray).join(' | ');
}

// ##############################################
/**
 * Converts integer array to hex string array.
 * Each byte is formatted as 2-digit uppercase hex (e.g., "0F", "A3").
 * @param {Array<number>} intArray - Array of integer values (0-255)
 * @returns {Array<string>} Array of hex strings
 */
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

// ##############################################
/**
 * Converts SysEx data to Blob URL for download.
 * Creates application/octet-stream Blob for binary download.
 * @param {Array<number>} sysexData - SysEx data bytes
 * @returns {string} Object URL for Blob
 */
function sysexToSyxFileUrl(sysexData) {
  logger.debug('sysex To Syx File Url', sysexData.length);

  const fileBuffer = new ArrayBuffer(sysexData.length);
  const uInt8ArrayView = new Uint8Array(fileBuffer);

  sysexData.map((item, i) => {
    uInt8ArrayView[i] = item;
  });

  const blob = new Blob([uInt8ArrayView], { type: 'application/octet-stream' });
  return window.URL.createObjectURL(blob);
}
