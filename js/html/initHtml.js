export { initHtml, updateMenuState, applyViewModeRules, showMidiAccessStateChange };
import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { setEventListener } from '../events/eventBootstrap.js';
import { getStorage } from '../storage/storage.js';
import { initHtmlPorts, setPortConnectionClass } from '../ports/portInteraction.js';
import { initHtmlMessage } from '../message/messageInit.js';
import { showMessage } from '../message/messageMonitor.js';
import { initPortBlacklist } from '../ports/portBlacklist.js';
import { logger } from '../utils/logger.js';
import { addClass, removeClass, hasClass, toggleClass } from './domUtils.js';

// #################################################################
logger.debug('%c initHtml.js loaded', 'color: orange; font-weight: bold;');

// initHtml ##########################################
// ##############################################
// Reihenfolge: Ports/UI aufbauen → Eventlistener → Sichtbarkeit/View-Mode aus Storage → Toggles setzen
function initHtml() {
  initHtmlPorts();
  initHtmlMessage();
  initPortBlacklist();
  setEventListener();
  restoreMenuItemVisibility();
  midiBay.menuClockTag = document.querySelector('.toggle_clock_message');
  restoreToggleStates();
}

// ################################################
function restoreMenuItemVisibility() {
  midiBay.menuItemVisibleMap = new Map();

  const savedVisibility = getStorage('WMB_html_visibility');
  if (savedVisibility) {
    restoreVisibilityFromStorage(savedVisibility);
  } else {
    hydrateVisibilityFromDom();
  }

  midiBay.elementViewMode = getStorage('WMB_element_view_mode') || 'multi';
  const toggleButton = document.querySelector('.toggle_element_view');
  if (toggleButton) {
    toggleButton.textContent = `view: ${midiBay.elementViewMode}`;
    toggleButton.dataset.viewMode = midiBay.elementViewMode;
  }

  applyViewModeRules(midiBay.elementViewMode);
  logger.debug('initMenuItemVisibility complete', midiBay.menuItemVisibleMap);
}

// ##############################################
function restoreVisibilityFromStorage(savedVisibility) {
  savedVisibility.forEach(([targetId, visibilityStatus]) => {
    const isVisible = visibilityStatus === 'visible';
    updateMenuState(targetId, isVisible);
  });
}

// ##############################################
function hydrateVisibilityFromDom() {
  const menuItems = document.querySelectorAll('#menu .menu a[data-menuitem_target_id]');
  menuItems.forEach((item) => {
    const targetId = item.dataset.menuitem_target_id;
    const menuItemTarget = document.getElementById(targetId);
    if (!menuItemTarget) return;
    const isVisible = !hasClass(menuItemTarget, 'js-hidden');
    updateMenuState(targetId, isVisible);
  });
}

// ################################################
/**
 * Setzt Menü-Sichtbarkeit und aktualisiert alle abhängigen Zustände
 * @param {string} targetId - ID des menu-member Elements
 * @param {boolean} isVisible - Soll sichtbar sein
 */
function updateMenuState(targetId, isVisible) {
  logger.debug('updateMenuState', targetId, isVisible);
  const target = document.getElementById(targetId);
  const menuButton = document.querySelector(
    `[data-menuitem_target_id="${targetId}"]`
  )?.parentElement;

  if (target) {
    toggleClass(target, 'js-hidden', !isVisible);
  }
  if (menuButton) {
    toggleClass(menuButton, 'visible', isVisible);
  }

  midiBay.menuItemVisibleMap.set(targetId, isVisible ? 'visible' : 'none');
}
// ################################################
// ################################################
/**
 * Wendet View-Mode spezifische UI-Regeln an
 * @param {string} viewMode - 'single' oder 'multi'
 */
function applyViewModeRules(viewMode) {
  const routingMenuButton = document.querySelector('li.menu.routing_menu');
  logger.debug('%capplyViewModeRules:', 'color: red;', viewMode);
  if (viewMode === 'multi') {
    updateMenuState('routing', true);
    addClass(routingMenuButton, 'js-hidden');
  } else {
    removeClass(routingMenuButton, 'js-hidden');
  }
}
// ##############################################
// Restore toggle states from storage
function restoreToggleStates() {
  // Restore visible_clock state
  const visibleClock = getStorage('WMB_visible_clock');
  if (visibleClock === true) {
    addClass(midiBay.menuClockTag, 'visible_clock');
  } else if (visibleClock === false) {
    removeClass(midiBay.menuClockTag, 'visible_clock');
  }
  // Default: keep initial HTML state if no storage value

  // Restore signals_on state
  const signalsOn = getStorage('WMB_signals_on');
  const signalsButton = document.querySelector('.toggle_signals');
  if (signalsOn === false) {
    midiBay.signalsEnabled = false;
    removeClass(signalsButton, 'signals_on');
  } else if (signalsOn === true) {
    midiBay.signalsEnabled = true;
    addClass(signalsButton, 'signals_on');
  }
  // Default: midiBay.signalsEnabled = true (from main.js) and HTML has signals_on class

  logger.debug('restoreToggleStates', { visibleClock, signalsOn });
}
// ##############################################
// function showMidiAccessStateChange(porttype, portname, status) {
function showMidiAccessStateChange(eventPort) {
  const portProbs = midiBay.portPropertiesManager?.getPortProperties
    ? getPortProperties(eventPort)
    : null;
  const displayName = portProbs ? portProbs.alias : eventPort.name;
  logger.info(
    'MidiAccessStateChange',
    `${eventPort.type} ${eventPort.connection}: "${displayName}"`
  );
  const message = `<span class="portname ${eventPort.type} ">${displayName}</span><span class="connection ${eventPort.connection}">${eventPort.connection}</span>`;
  // we rely on portProperties for UI tags; if portProperties exists and has a tag or tagId, proceed
  if (portProbs && (portProbs.tag || portProbs.tagId)) {
    setPortConnectionClass(eventPort);
    // showMessage(msg, 'connection');
    showMessage(message, 'connection', eventPort.type, eventPort.name);
  }
}
