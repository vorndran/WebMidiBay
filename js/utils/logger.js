/**
 * Zentrales Logging-Modul für Debug- und Info-Ausgaben
 * Kann über die enabled-Flag global aktiviert/deaktiviert werden
 * 
 * Wichtig: Um Datei und Zeilennummer in der Browser-Konsole korrekt anzuzeigen,
 * werden die console-Methoden direkt gebunden, nicht gewrappt.
 */

const enabled = true;

// Noop-Funktionen für deaktiviertes Logging
const noop = () => {};

/**
 * Logger-Objekt mit konfigurierbarem Logging
 * Setze logger.enabled = false um alle Logs zu deaktivieren
 */
export const logger = {
  _enabled: enabled,
  
  get enabled() {
    return this._enabled;
  },
  
  set enabled(value) {
    this._enabled = value;
    // Re-bind methods when enabled state changes
    this.debug = value ? console.log.bind(console) : noop;
    this.info = value ? console.info.bind(console) : noop;
    this.warn = value ? console.warn.bind(console) : noop;
    // error is always enabled
  },
  
  // Initial binding - zeigt korrekte Datei und Zeile in der Konsole
  debug: enabled ? console.log.bind(console) : noop,
  info: enabled ? console.info.bind(console) : noop,
  warn: enabled ? console.warn.bind(console) : noop,
  
  // Errors werden immer ausgegeben
  error: console.error.bind(console)
};
