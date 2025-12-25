/**
 * Port Blacklist Management
 *
 * Verwaltet die Liste der ausgeblendeten MIDI-Ports.
 * Eine Checkbox steuert Input und Output gleichzeitig wenn beide vorhanden sind.
 */

export {
  initPortBlacklist,
  togglePortBlacklistUI,
  clickedPortBlacklistCheckbox,
  applyPortBlacklist,
  storePortBlacklist,
  restorePortBlacklist,
  applyAndReloadBlacklist,
  cancelBlacklistChanges,
  loadBlacklistFromStorage,
  getNameMap,
  getFilteredNameMap,
};

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { getPortProperties } from '../utils/helpers.js';
import { addClass, hasClass, toggleClass } from '../html/domUtils.js';
import { clearInnerHTML, setText } from '../html/domContent.js';
import { getStorage, setStorage } from '../storage/storage.js';
import { updateLayout } from '../html/htmlUpdater.js';

// ################################################
/**
 * Initialisiert die Port-Blacklist UI
 * Generiert Checkboxen für alle verfügbaren Ports
 */
function initPortBlacklist() {
  logger.debug('initPortBlacklist');

  const listContainer = document.getElementById('port_blacklist_list');
  if (!listContainer) {
    logger.warn('port_blacklist_list container not found');
    return;
  }

  // Lösche bestehende Einträge
  clearInnerHTML(listContainer);

  // Iteriere über ALLE Input-Ports (ungefiltert)
  const inMap = midiBay.allInNameMap || midiBay.inNameMap;
  inMap.forEach((inPort) => {
    const portName = inPort.name;

    // Prüfe ob es einen passenden Output gibt (in ungefilterter Map)
    const outMap = midiBay.allOutNameMap || midiBay.outNameMap;
    const outPort = outMap.get(portName.replace('Input', 'Output'));
    const portType = outPort ? 'pair' : 'input-only';

    // Erstelle Checkbox
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = inPort.id;
    checkbox.dataset.portName = portName;
    checkbox.dataset.portType = portType;
    addClass(checkbox, 'port_blacklist_checkbox');

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    const inProps = portType === 'pair' ? getPortProperties(inPort) : { alias: portName };
    setText(label, `${inProps.alias} ${portType === 'pair' ? '(I/O)' : '(I)'}`);

    li.appendChild(checkbox);
    li.appendChild(label);
    listContainer.appendChild(li);
  });

  // Prüfe auf Output-only Ports (in ungefilterter Map)
  const outMap = midiBay.allOutNameMap || midiBay.outNameMap;
  outMap.forEach((outPort) => {
    const portName = outPort.name;

    // Nur hinzufügen wenn kein Input mit gleichem Namen existiert
    if (!inMap.has(portName.replace('Output', 'Input'))) {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = outPort.id;
      checkbox.dataset.portName = portName;
      checkbox.dataset.portType = 'output-only';
      addClass(checkbox, 'port_blacklist_checkbox');

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      const outProps = getPortProperties(outPort);
      setText(label, `${outProps.alias} (O)`);

      li.appendChild(checkbox);
      li.appendChild(label);
      listContainer.appendChild(li);
    }
  });

  // Restore gespeicherte Blacklist
  restorePortBlacklist();

  logger.debug('initPortBlacklist complete', midiBay.portBlacklist);
}

// ################################################
/**
 * Toggelt die Sichtbarkeit der Blacklist UI
 * @param {Event} eClick - Das Click-Event
 */
function togglePortBlacklistUI(eClick) {
  logger.debug('togglePortBlacklistUI');

  const container = document.querySelector('.port_blacklist_container');
  if (!container) return;

  const isHidden = hasClass(container, 'js-hidden');

  // Beim Schließen: Änderungen verwerfen
  if (!isHidden) {
    cancelBlacklistChanges();
    return;
  }

  // Beim Öffnen: Container anzeigen und ggf. initialisieren
  toggleClass(container, 'js-hidden');
  if (container.querySelector('#port_blacklist_list').children.length === 0) {
    initPortBlacklist();
  }
}

// ################################################
/**
 * Event-Handler für Checkbox-Clicks
 * @param {Event} eClick - Das Click-Event
 */
function clickedPortBlacklistCheckbox(eClick) {
  const checkbox = eClick.target;
  if (!hasClass(checkbox, 'port_blacklist_checkbox')) return;

  const portName = checkbox.dataset.portName;
  const portType = checkbox.dataset.portType;
  logger.debug('clickedPortBlacklistCheckbox', portName, portType, checkbox.checked);

  if (checkbox.checked) {
    // Füge den Port zur Blacklist hinzu
    midiBay.portBlacklist.add(portName);

    // Bei Paaren auch den Output-Port hinzufügen
    if (portType === 'pair') {
      const outPortName = portName.replace('Input', 'Output');
      midiBay.portBlacklist.add(outPortName);
    }
  } else {
    // Entferne den Port aus der Blacklist
    midiBay.portBlacklist.delete(portName);

    // Bei Paaren auch den Output-Port entfernen
    if (portType === 'pair') {
      const outPortName = portName.replace('Input', 'Output');
      midiBay.portBlacklist.delete(outPortName);
    }
  }

  // Speichere nur, aber kein Reload - Benutzer muss Apply-Button klicken
  storePortBlacklist();
}

// ################################################
/**
 * Wendet die Blacklist auf alle Ports an
 * Da Ports bereits beim Laden gefiltert werden, ist diese Funktion
 * hauptsächlich für UI-Feedback vor dem Reload
 */
function applyPortBlacklist() {
  logger.debug('applyPortBlacklist - Page wird neu geladen', midiBay.portBlacklist);
  // Keine Aktion nötig - Ports werden beim nächsten Load gefiltert
}

// ################################################
/**
 * Speichert die Blacklist im Storage
 */
function storePortBlacklist() {
  logger.debug('storePortBlacklist');
  setStorage('WMB_port_blacklist', [...midiBay.portBlacklist]);
}

// ################################################
/**
 * Lädt die Blacklist aus dem Storage und gibt ein Set zurück
 * @returns {Set<string>} Set mit geblacklisteten Port-Namen
 */
function loadBlacklistFromStorage() {
  const stored = getStorage('WMB_port_blacklist');
  const blacklist = stored && Array.isArray(stored) ? new Set(stored) : new Set();
  midiBay.portBlacklist = blacklist;
  return blacklist;
}

// ################################################
/**
 * Lädt die Blacklist aus dem Storage
 * Setzt nur die Checkboxen, wendet aber noch keine Blacklist an
 */
function restorePortBlacklist() {
  logger.debug('restorePortBlacklist');

  const blacklist = loadBlacklistFromStorage();
  if (blacklist.size === 0) return;

  // Setze Checkboxen auf gespeicherten Zustand
  blacklist.forEach((portName) => {
    const checkbox = document.querySelector(
      `.port_blacklist_checkbox[data-port-name="${portName}"]`
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });

  logger.debug('restorePortBlacklist complete', midiBay.portBlacklist);
}

// ################################################
/**
 * Wendet die Blacklist an und lädt die Seite neu
 * Wird vom Apply-Button aufgerufen
 */
function applyAndReloadBlacklist() {
  logger.debug('applyAndReloadBlacklist - storing and reloading');
  storePortBlacklist();

  // setTimeout notwendig damit Browser Event-Handler-Stack abarbeiten kann
  setTimeout(() => window.location.reload(), 1);
}

// ################################################
/**
 * Bricht Blacklist-Änderungen ab und lädt ursprünglichen Zustand
 */
function cancelBlacklistChanges() {
  logger.debug('cancelBlacklistChanges - restoring from storage');

  // Lade gespeicherte Blacklist neu
  const blacklist = loadBlacklistFromStorage();

  // Setze alle Checkboxen auf gespeicherten Zustand zurück
  document.querySelectorAll('.port_blacklist_checkbox').forEach((checkbox) => {
    const portName = checkbox.dataset.portName;
    checkbox.checked = blacklist.has(portName);
  });

  // Verstecke Container
  const container = document.querySelector('.port_blacklist_container');
  if (container) {
    addClass(container, 'js-hidden');
  }
}
// ################################################
function getFilteredNameMap(nameMap) {
  const blacklist = loadBlacklistFromStorage();
  return new Map(
    Array.from(nameMap.values())
      .filter((port) => !blacklist.has(port.name))
      .map((port) => [port.name, port])
  );
}
// ################################################
function getNameMap(list) {
  return new Map(Array.from(list.values()).map((io) => [io.name, io]));
}
