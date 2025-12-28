/**
 * Zentrales Logging-Modul für Debug- und Info-Ausgaben
 *
 * Wichtig: Um Datei und Zeilennummer in der Browser-Konsole korrekt anzuzeigen,
 * werden die console-Methoden direkt gebunden, nicht gewrappt.
 *
 * Production: DEVELOPER_MODE = false deaktiviert alle Debug-Features
 */

// ⚠️ Vor Publish auf false setzen!
export const DEVELOPER_MODE = true;
// export const DEVELOPER_MODE = false;

// Noop-Funktionen für deaktiviertes Logging
const noop = () => {};

/**
 * Logger-Objekt mit konfigurierbarem Logging
 */
export const logger = {
  // Initial binding - zeigt korrekte Datei und Zeile in der Konsole
  debug: DEVELOPER_MODE ? console.log.bind(console) : noop,
  info: DEVELOPER_MODE ? console.info.bind(console) : noop,
  warn: DEVELOPER_MODE ? console.warn.bind(console) : noop,

  // Errors werden immer ausgegeben
  error: console.error.bind(console),
};
