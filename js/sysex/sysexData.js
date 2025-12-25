/**
 * sysexData.js - Pure SysEx Data Processing
 *
 * Handles collection and parsing of SysEx data from MIDI streams.
 * No UI dependencies - pure data layer.
 */

export { collectSysexData, parseSysexData, concatSysexArray };

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { MIDI_SYSEX_START, MIDI_SYSEX_END } from '../constants/midiConstants.js';

// ##############################################
/**
 * Collects SysEx data from incoming MIDI messages.
 * Manages state for multi-message SysEx collection.
 * @param {Uint8Array} midiData - MIDI message data
 */
function collectSysexData(midiData) {
  const statusByte = midiData[0];

  // Ignore all non-SysEx MIDI messages
  // Accept: 0xF0 (SysEx Start), 0xF7 (SysEx End), < 0x80 (Data bytes during collection)
  if (statusByte >= 0x80 && statusByte !== MIDI_SYSEX_START && statusByte !== MIDI_SYSEX_END) {
    return; // Regular MIDI message (Note, CC, Clock, etc.) - ignore
  }

  // Data bytes (< 0x80) are only relevant during active SysEx collection
  if (statusByte < 0x80 && !midiBay.collectingSysEx) {
    return; // Orphaned data byte, not part of SysEx
  }

  const lastByte = midiData[midiData.length - 1];

  if (statusByte === MIDI_SYSEX_START) {
    midiBay.sysexMessage = [];
    midiBay.sysExWasSent = false;
    midiBay.collectingSysEx = true;
  } else if (!midiBay.collectingSysEx) {
    return; // Safety check
  }

  const parsedSysexData = parseSysexData(midiData);
  concatSysexArray(parsedSysexData);

  if (lastByte === MIDI_SYSEX_END) {
    midiBay.collectingSysEx = false;
  }
}

// ##############################################
/**
 * Parses MIDI data and extracts only valid SysEx bytes.
 * @param {Uint8Array} midiData - Raw MIDI data
 * @returns {Array<number>} Filtered SysEx bytes
 */
function parseSysexData(midiData) {
  let sysExBuffer = [];

  // Parse byte by byte
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
/**
 * Concatenates new SysEx data to the global collection buffer.
 * @param {Array<number>} sysexArray - SysEx bytes to append
 */
function concatSysexArray(sysexArray) {
  let sysexMsg = Array.from(midiBay.sysexMessage);
  midiBay.sysexMessage = sysexMsg.concat(Array.from(sysexArray));
}
