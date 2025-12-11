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
 * Entfernt mehrere CSS-Klassen von einem Element
 * @param {HTMLElement} element - Das HTML-Element
 * @param {string[]} classes - Array von Klassennamen
 */
export const removeClasses = (element, classes) => {
  classes.forEach((cls) => element.classList.remove(cls));
};

/**
 * Fügt mehrere CSS-Klassen zu einem Element hinzu
 * @param {HTMLElement} element - Das HTML-Element
 * @param {string[]} classes - Array von Klassennamen
 */
export const addClasses = (element, classes) => {
  classes.forEach((cls) => element.classList.add(cls));
};

/**
 * Setzt CSS-Klassen basierend auf einer Bedingung
 * @param {HTMLElement} element - Das HTML-Element
 * @param {string} className - Die CSS-Klasse
 * @param {boolean} condition - Wenn true, wird die Klasse hinzugefügt, sonst entfernt
 */
export const toggleClass = (element, className, condition) => {
  condition ? element.classList.add(className) : element.classList.remove(className);
};

/**
 * Ersetzt eine Klasse durch eine andere
 * @param {HTMLElement} element - Das HTML-Element
 * @param {string} oldClass - Die zu entfernende Klasse
 * @param {string} newClass - Die hinzuzufügende Klasse
 */
export const replaceClass = (element, oldClass, newClass) => {
  element.classList.remove(oldClass);
  element.classList.add(newClass);
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
 * Aktualisiert die Anzeige der Fenstergröße in Pixel und rem
 * @param {string} selector - CSS-Selektor für das Anzeige-Element (z.B. 'p.size')
 */
export const updateWindowSizeDisplay = (selector = 'p.size') => {
  const width = window.outerWidth;
  const height = window.outerHeight;

  // REM-Werte basierend auf der Root-Schriftgröße berechnen
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const widthRem = (width / rootFontSize).toFixed(1);
  const heightRem = (height / rootFontSize).toFixed(1);

  const sizeText = `${width} x ${height} px (${widthRem} x ${heightRem} rem)`;

  // Importiert setText dynamisch, um zirkuläre Abhängigkeiten zu vermeiden
  import('../html/domContent.js').then(({ setText }) => {
    setText(selector, sizeText);
  });
};
// ##################################################
