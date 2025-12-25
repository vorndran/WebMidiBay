/**
 * Port Menu Management
 *
 * Verwaltet den Zustand und die Logik des Port-Menüs.
 * Enthält UI-Zustandsverwaltung für Menü-Aktivierung und Flags.
 */

export {
  removeActiveFromPortMenu,
  resetPortMenuFunctions,
  setPortMenuActive,
  getPortMenuAction,
  clickedPortMenuRename,
  clickedPortMenuOpenClose,
  clickedPortMenuRouting,
};

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';

import { addClass, hasClass, toggleClass, removeClassFromAll } from '../html/domUtils.js';
import { unselectSelectedPort } from '../filter/filter.js';
import { getPortProperties, getSelectedPortProperties } from '../utils/helpers.js';
import { setFilterPortInfoTagClass, setFilterContainerClass } from '../filter/filterCss.js';
import { setChannelClass } from '../filter/filterChannel.js';
import { removeSelectedPort } from './portSelection.js';

// ################################################
/**
 * Setzt alle Port-Menü-spezifischen Flags zurück
 */
function resetPortMenuFunctions() {
  midiBay.renamePortsFlag = false;
  midiBay.openClosePortsFlag = false;
  if (hasClass(midiBay.graphTag, 'routing')) {
    clickedPortMenuRouting(false);
  }
}

// ################################################
/**
 * Aktiviert ein Port-Menü oder deaktiviert es, wenn es bereits aktiv ist
 * @param {HTMLElement} menuElement - Das Menü-Element
 * @returns {boolean} true wenn aktiviert, false wenn deaktiviert
 */
function setPortMenuActive(menuElement) {
  // Ermittle aktuell aktives Port-Menü vor Änderungen
  const isCurrentMenuActive = hasClass(menuElement, 'active');

  // Zentrale active-Verwaltung für alle Port-Menüs
  removeActiveFromPortMenu();
  if (isCurrentMenuActive) {
    addClass('.portmenu.select', 'active');
    return false; // Nicht weiter aktivieren
  }

  addClass(menuElement, 'active');
  return true; // Weiter mit switch-Logic
}
// ################################################
/**
 * Entfernt 'active' Klasse von allen Port-Menüs
 */
function removeActiveFromPortMenu() {
  removeClassFromAll('.portmenu', 'active');
}

// ################################################
/**
 * Ermittelt die Aktion eines Port-Menüs anhand seiner CSS-Klassen
 * @param {HTMLElement} menuElement - Das Menü-Element
 * @returns {string|null} Die Aktion ('rename', 'routing', 'openclose') oder null
 */
function getPortMenuAction(menuElement) {
  return ['rename', 'routing', 'openclose'].find((action) => hasClass(menuElement, action)) || null;
}

// ################################################
/**
 * Event-Handler: Aktiviert den Rename-Modus für Ports
 * @param {Event} eClick - Das Click-Event
 */
function clickedPortMenuRename(eClick) {
  logger.debug('clickedPortMenuRename: ', eClick.target.id);

  midiBay.renamePortsFlag = true;
  unselectSelectedPort();
}

// ################################################
/**
 * Event-Handler: Aktiviert den Open/Close-Modus für Ports
 * @param {Event} eClick - Das Click-Event
 */
function clickedPortMenuOpenClose(eClick) {
  logger.debug('clickedPortMenuOpenClose', eClick.target.id);

  midiBay.openClosePortsFlag = true;
  midiBay.openCloseInProgress = false;
  unselectSelectedPort();
}

// ################################################
/**
 * Event-Handler: Aktiviert/Deaktiviert den Routing-Modus
 * @param {boolean} isRouting - Soll Routing aktiviert werden?
 */
function clickedPortMenuRouting(isRouting) {
  logger.debug('clickedPortMenuRouting', isRouting);

  toggleClass(midiBay.graphTag, 'routing', isRouting);

  midiBay.portByTagIdMap.forEach((port) => {
    toggleClass(getPortProperties(port).tag, 'routing', isRouting);
  });

  if (midiBay.selectedPort?.type == 'output') {
    const selectedPortProbs = getSelectedPortProperties();
    removeSelectedPort(selectedPortProbs.tag);
  }

  setFilterPortInfoTagClass();
  setFilterContainerClass();
  setChannelClass();
}
