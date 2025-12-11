export { initHtml, updateMenuState, applyViewModeRules, showMidiAccessStateChange };
import { midiBay } from '../main.js';
import { setEventListener } from './htmlEvents.js';
import { getStorage } from '../storage/storage.js';
import { initHtmlPorts, setPortConnectionClass } from './htmlPorts.js';
import { initHtmlMessage, showMessage } from './htmlMessage.js';
import { initPortBlacklist } from './htmlBlacklist.js';
import { logger } from '../utils/logger.js';
import { addClass, removeClass, toggleDisplayClass } from './domStyles.js';

// #################################################################
logger.debug('%c html.js loaded', 'color: orange; font-weight: bold;');

// initHtml ##########################################
function initHtml() {
  initHtmlPorts();
  initHtmlMessage();
  initPortBlacklist();
  setEventListener();
  restoreMenuItemVisibility();
  midiBay.menuClockTag = document.querySelector('.clock');
  restoreToggleStates();
}

// ################################################
function restoreMenuItemVisibility() {
  // Nur noch die Storage-kritische Map für Sichtbarkeits-Zustand
  midiBay.menuItemVisibleMap = new Map();

  // Lade gespeicherte Sichtbarkeits-Zustände oder erkenne DOM-Zustand
  const savedVisibility = getStorage('WMB_html_visibility');
  if (savedVisibility) {
    // Restore UI-Zustand aus Storage mit updateMenuState (setzt automatisch Map + UI)
    savedVisibility.forEach(([targetId, visibilityStatus]) => {
      const isVisible = visibilityStatus === 'visible';
      updateMenuState(targetId, isVisible);
    });
  } else {
    // Initialisiere mit aktuellem DOM-Zustand (Map + UI)
    const menuItems = document.querySelectorAll('#menu .menu a[data-menuitem_target_id]');
    menuItems.forEach((item) => {
      const targetId = item.dataset.menuitem_target_id;
      const menuItemTarget = document.getElementById(targetId);
      if (menuItemTarget) {
        const isVisible = !menuItemTarget.classList.contains('js-hidden');
        updateMenuState(targetId, isVisible);
      }
    });
  }
  logger.debug('%cinitMenuItemVisibility', 'color: orange; font-weight: bold;');

  // Element View Mode: 'single' oder 'multi' (default)
  midiBay.elementViewMode = getStorage('WMB_element_view_mode') || 'multi';
  // addClass(document.querySelector('.container'), midiBay.elementViewMode);
  // Initialisiere View Mode Button Text
  const toggleButton = document.querySelector('.toggle_element_view');
  if (toggleButton) {
    toggleButton.textContent = `view: ${midiBay.elementViewMode}`;
    toggleButton.dataset.viewMode = midiBay.elementViewMode;
  }

  // Wende View-Mode Regeln an
  applyViewModeRules(midiBay.elementViewMode);

  logger.debug('initMenuItemVisibility complete', midiBay.menuItemVisibleMap);
}

// ##############################################
// ################################################
/**
 * Setzt Menü-Sichtbarkeit und aktualisiert alle abhängigen Zustände
 * @param {string} targetId - ID des menu-member Elements
 * @param {boolean} isVisible - Soll sichtbar sein
 */
function updateMenuState(targetId, isVisible) {
  const target = document.getElementById(targetId);
  const menuButton = document.querySelector(
    `[data-menuitem_target_id="${targetId}"]`
  )?.parentElement;

  if (target) {
    toggleDisplayClass(target, 'js-hidden', !isVisible);
  }
  if (menuButton) {
    toggleDisplayClass(menuButton, 'visible', isVisible);
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
    // Multi-Mode: routing sichtbar, routing_menu versteckt
    updateMenuState('routing', true);
    addClass(routingMenuButton, 'js-hidden');
  } else {
    // Single-Mode: routing_menu sichtbar für Navigation
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
    ? midiBay.portPropertiesManager.getPortProperties(eventPort)
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
