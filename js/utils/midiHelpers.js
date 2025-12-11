export { getChannel, getMidiMsg, getNote };

import { notes, mmsg } from '../constants/midiConstants.js';

// ##########################################################
/**
 * Extrahiert die MIDI-Kanalnummer aus einem Status-Byte.
 * @param {number} midiData - MIDI-Status-Byte (0-255)
 * @returns {string} Kanalnummer als String (1-16) oder ""
 */
function getChannel(midiData) {
  return `${(midiData % 16) + 1}`;
}

// ##########################################################
/**
 * Wandelt MIDI-Status-Byte in lesbaren Message-Typ um.
 * @param {number} midiData - MIDI-Status-Byte
 * @returns {string} Message-Typ (z.B. "Note On", "CC")
 */
function getMidiMsg(midiData) {
  return `${mmsg[Math.floor(midiData / 16)]}`;
}

// ##########################################################
/**
 * Wandelt MIDI-Notennummer in Notenname mit Oktave um.
 * @param {number} midiData - MIDI-Notennummer (0-127)
 * @returns {string} Notenname mit Oktave (z.B. "C4", "A#5")
 */
function getNote(midiData) {
  return `${notes[midiData % 12]}${Math.floor(midiData / 12) - 1}`;
}
