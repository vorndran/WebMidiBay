/**
 * Helper-Funktionen für häufig verwendete Patterns im MIDI-Code
 */
import { midiBay } from '../main.js';

/**
 * Kurze Helper-Funktion für PortProperties-Zugriff
 * @param {MIDIPort} port - Der MIDI-Port
 * @returns {PortPortProperties} Die Metadaten des Ports
 */
export const getPortProperties = (port) => {
  return midiBay.portPropertiesManager.getPortProperties(port);
};

/**
 * Findet einen Port anhand seiner Tag-ID
 * @param {string} tagId - Die Tag-ID des Ports
 * @returns {MIDIPort|null} Der gefundene Port oder null
 */
export const getPortByTagId = (tagId) => {
  return midiBay.portPropertiesManager.getPortByTagId(tagId, midiBay.portByTagIdMap);
};

/**
 * Holt den aktuell ausgewählten Port
 * @returns {MIDIPort|false} Der Port oder false wenn kein Port ausgewählt
 */
export const getSelectedPort = () => {
  return midiBay.selectedPort || false;
};

/**
 * Holt die Metadaten des aktuell ausgewählten Ports
 * @returns {PortPortProperties|false} Die Metadaten oder false wenn kein Port ausgewählt
 */
export const getSelectedPortProperties = () => {
  return midiBay.selectedPort
    ? midiBay.portPropertiesManager.getPortProperties(midiBay.selectedPort)
    : false;
};

/**
 * Iteriert über eine Port-Map und führt eine Funktion mit Metadaten aus
 * @param {Map} portMap - Die Port-Map (inNameMap oder outNameMap)
 * @param {Function} callback - Callback (port, portProperties, name) => void
 */
export const forEachPortWithPortProperties = (portMap, callback) => {
  portMap.forEach((port, name) => {
    const portProperties = midiBay.portPropertiesManager.getPortProperties(port);
    callback(port, portProperties, name);
  });
};

/**
 * Deep-Clone eines Objekts über JSON
 * @param {Object} obj - Das zu klonende Objekt
 * @returns {Object} Geklontes Objekt
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Sanitiert einen Dateinamen für systemweite Kompatibilität
 * Erlaubt nur sichere Zeichen (A-Z, a-z, 0-9, _, -, Leerzeichen, Punkt) und begrenzt die Länge
 * @param {string} filename - Der zu bereinigende Dateiname
 * @returns {string} Bereinigter Dateiname (max 50 Zeichen)
 */
export const sanitizeFilename = (filename) => {
  // Führende/abschließende Leerzeichen und Punkte entfernen
  let sanitized = filename.trim().replace(/^\.+|\.+$/g, '');

  // Nur sichere Zeichen erlauben: Buchstaben, Zahlen, Unterstrich, Bindestrich, Leerzeichen, Punkt
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\- .]/g, '_');

  // Multiple aufeinanderfolgende Sonderzeichen zu einem reduzieren
  sanitized = sanitized.replace(/_+/g, '_');
  sanitized = sanitized.replace(/\.+/g, '.');
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Führende/abschließende Unterstriche entfernen
  sanitized = sanitized.replace(/^_+|_+$/g, '');

  // Auf 50 Zeichen begrenzen
  sanitized = sanitized.slice(0, 50);

  // Fallback bei leerem String
  return sanitized || 'unnamed';
};

// ################################################
// DOM-Funktionen wurden nach html/domClasses.js verschoben:
// - removeClasses() → domClasses.js
// - addClasses() → domClasses.js
// - toggleClass() → domClasses.js (bereits vorhanden)
// - replaceClass() → domClasses.js
//
// Dev-Utilities wurden nach utils/dev/devHelpers.js verschoben:
// - updateWindowSizeDisplay() → dev/devHelpers.js
// ################################################
