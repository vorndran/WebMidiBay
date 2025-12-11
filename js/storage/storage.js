/**
 * Generic Storage Functions
 *
 * Grundlegende sessionStorage-Operationen ohne Domain-spezifische Logik.
 * Alle Funktionen arbeiten mit dem "WMB_"-Prefix für Storage-Keys.
 */

export {
  clearStorage,
  setStorage,
  getStorage,
  getStorageKeys,
  removeStorage,
  loadJsonFileToStorage,
  storageToJson,
};

import { logger } from '../utils/logger.js';

const storage = sessionStorage;

// ##################################################
function setStorage(storageKey, storageValue) {
  logger.debug('setStorage', storageKey);
  storage.setItem(storageKey, JSON.stringify(storageValue));
}

// ##################################################
function getStorage(storageKey) {
  return JSON.parse(storage.getItem(storageKey));
}

// ##################################################
function getStorageKeys(startString) {
  return Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter((key) =>
    key.startsWith(startString)
  );
}

// ##################################################
function removeStorage(storageKey) {
  storage.removeItem(storageKey);
}

// ##################################################
function clearStorage() {
  logger.debug('clearStorage', storage.length);
  const storageLength = storage.length;
  for (let i = storageLength - 1; i >= 0; i--) {
    if (storage.key(i)?.startsWith('WMB_')) {
      storage.removeItem(storage.key(i));
    }
  }
}

// ##################################################
function storageToJson() {
  let textToSave = '';
  let lineToSave = '';
  const storageLength = storage.length;

  for (let i = 0; i < storageLength; i++) {
    if (storage.key(i).startsWith('WMB_')) {
      lineToSave = `"${storage.key(i)}": ${storage.getItem(storage.key(i))}`;
      textToSave += textToSave.length > 0 ? ',\r\n' + lineToSave : lineToSave;
    }
  }

  return `{${textToSave}}`;
}

// ##################################################
function loadJsonFileToStorage(file) {
  const reader = new FileReader();
  reader.onload = () => restoreJsonFilesToStorage(JSON.parse(reader.result));
  reader.readAsText(file);
}

// ##################################################
function restoreJsonFilesToStorage(jsonData) {
  logger.info('restoreJsonFilesToStorage', Object.keys(jsonData));

  const storageKeys = Object.keys(jsonData);
  if (!storageKeys.every((key) => key.startsWith('WMB_'))) return;

  storageKeys.forEach((key) => {
    storage.setItem(key, JSON.stringify(jsonData[key]));
  });

  location.reload();
}
