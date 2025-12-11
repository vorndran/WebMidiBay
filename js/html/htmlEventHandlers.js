/**
 * HTML Event Handlers
 *
 * Konkrete Implementierungen der Event-Handler für UI-Interaktionen.
 * Separiert von der Event-Registrierung für bessere Wartbarkeit und Testbarkeit.
 */

export {
  click,
  clickMenu,
  clickedPortMenu,
  clickDownloadSysexFile,
  clickDownloadSettingsFile,
  clickedUnselectSelectedPort,
  renameSettingsFile,
  clearAllStorage,
  clickSettingsFileUploadInput,
  clickSysexFileUploadInput,
  clickedWindow,
  toggleVisibleClock,
  handleKeyboardShortcuts,
  toggleElementViewMode,
  togglePortBlacklistUI,
  clickedPortBlacklistCheckbox,
  applyAndReloadBlacklist,
  cancelBlacklistChanges,
  toggleSignals,
};

import { logger } from '../utils/logger.js';
import { midiBay } from '../main.js';
import { removeClassFromAll } from './domClasses.js';
import { unselectSelectedPort } from '../filter/filter.js';
import { clearStorage, setStorage } from '../storage/storage.js';
import { downloadSettingsFile, downloadSysexFile } from './htmlForm.js';
import { updateLayout } from './htmlUpdater.js';
import { updateMenuState, applyViewModeRules } from './html.js';
import {
  clickedPortMenuRename,
  clickedPortMenuOpenClose,
  clickedPortMenuRouting,
  resetPortMenuFunctions,
  setPortMenuActive,
  getPortMenuAction,
} from './htmlPortMenu.js';
import {
  togglePortBlacklistUI,
  clickedPortBlacklistCheckbox,
  applyAndReloadBlacklist,
  cancelBlacklistChanges,
  initPortBlacklist,
} from './htmlBlacklist.js';
import { preventAndStop, toggleDisplayClass, addClass, removeClass } from './domStyles.js';

// Import spezifische Port-Menü Handler
// ################################################
function click(eClick) {
  logger.debug('click', eClick.target.id || eClick.target.className);
  eClick.stopPropagation();
}

// ################################################
function clickMenu(eClick) {
  const targetId = eClick.target.dataset.menuitem_target_id;
  if (!targetId) return;
  const menuItemTarget = document.getElementById(targetId);

  logger.debug('clickMenu: ', targetId, 'mode:', midiBay.elementViewMode);

  // Single-View: Alle anderen Elemente verstecken
  if (midiBay.elementViewMode === 'single') {
    hideAllMenuItemsExcept(targetId);
  }

  // Toggle mit updateMenuState
  const isCurrentlyHidden = menuItemTarget.classList.contains('js-hidden');
  const shouldShow = isCurrentlyHidden;

  updateMenuState(targetId, shouldShow);

  // Speichere Status und redraw
  setStorage('WMB_html_visibility', [...midiBay.menuItemVisibleMap]);
  updateLayout(true);
}

// ################################################
function hideAllMenuItemsExcept(exceptId = null) {
  for (const [id, state] of midiBay.menuItemVisibleMap) {
    if (id !== exceptId && state === 'visible') {
      updateMenuState(id, false);
    }
  }
}
// ################################################
function toggleElementViewMode(eClick) {
  preventAndStop(eClick);

  // Toggle zwischen 'single' und 'multi'
  midiBay.elementViewMode = midiBay.elementViewMode === 'single' ? 'multi' : 'single';

  // Speichere Einstellung
  setStorage('WMB_element_view_mode', midiBay.elementViewMode);

  // Update Button Text und data-attribute
  eClick.target.textContent = `view: ${midiBay.elementViewMode}`;
  eClick.target.dataset.viewMode = midiBay.elementViewMode;

  // Wende View-Mode Regeln an
  applyViewModeRules(midiBay.elementViewMode);

  // Falls single-mode: Settings direkt aktivieren
  if (midiBay.elementViewMode === 'single') {
    // Verstecke alle anderen Menüs
    hideAllMenuItemsExcept('settings');
    // Aktiviere settings
    updateMenuState('settings', true);
    // Speichere Status
    setStorage('WMB_html_visibility', [...midiBay.menuItemVisibleMap]);
  }
  toggleDisplayClass(
    document.querySelector('.container'),
    'single',
    midiBay.elementViewMode === 'single'
  );
  updateLayout();

  logger.debug('View mode changed to:', midiBay.elementViewMode);
}
// ################################################
function clickedPortMenu(eClick) {
  const menuElement = eClick.target.parentElement;
  const action = getPortMenuAction(menuElement);
  logger.debug('clickedPortMenu: ', action);

  preventAndStop(eClick);
  resetPortMenuFunctions();

  if (!setPortMenuActive(menuElement)) return;

  // Nur Handler für Aktionen ausführen, die etwas tun müssen
  switch (action) {
    case 'rename':
      clickedPortMenuRename(eClick);
      break;
    case 'routing':
      clickedPortMenuRouting(true);
      break;
    case 'openclose':
      clickedPortMenuOpenClose(eClick);
      break;
    default:
      // 'select' oder unbekannte Aktion - keine weitere Behandlung nötig
      break;
  }
}

// ################################################
function clickDownloadSysexFile(eClick) {
  logger.debug('clickDownloadSysexFile');
  preventAndStop(eClick);
  downloadSysexFile();
}

// ################################################
function clickDownloadSettingsFile(eClick) {
  logger.debug('clickDownloadSettingsFile');
  preventAndStop(eClick);
  downloadSettingsFile();
}

// ################################################
function clickedUnselectSelectedPort(eClick) {
  logger.debug('clickedUnselectSelectedPort');
  preventAndStop(eClick);
  unselectSelectedPort();
}

// ################################################
function renameSettingsFile(eClick) {
  eClick.target.addEventListener('keydown', blurOnEnterOrEscape);
  eClick.target.addEventListener('focusout', editSettingsFocusOut);
}

// ################################################
function blurOnEnterOrEscape(eKey) {
  logger.debug('blurOnEnterOrEscape');

  if (eKey.code == 'Escape' || eKey.code == 'Enter') {
    eKey.target.blur();
  }
}

// ################################################
function editSettingsFocusOut(eFocusout) {
  logger.debug('edit Settings Focus Out!');
  eFocusout.target.removeEventListener('keydown', blurOnEnterOrEscape);
  eFocusout.target.removeEventListener('focusout', editSettingsFocusOut);
}

// ################################################
function clearAllStorage() {
  clearStorage();
  location.reload();
}

// ################################################
function clickSettingsFileUploadInput(eClick) {
  preventAndStop(eClick);
  document.getElementById('settings_file_upload').click();
}

// ################################################
function clickSysexFileUploadInput(eClick) {
  preventAndStop(eClick);
  document.getElementById('sysex_file_upload').click();
}

// ################################################
function clickedWindow(eClick) {
  logger.debug(`clicked Window Event`);

  // Prüfe ob Blacklist-Container offen ist
  const blacklistContainer = document.querySelector('.port_blacklist_container');
  if (!blacklistContainer || blacklistContainer.classList.contains('js-hidden')) {
    return;
  }

  // Prüfe ob Klick außerhalb des Containers und außerhalb des Toggle-Buttons war
  const clickedInsideContainer = blacklistContainer.contains(eClick.target);
  const clickedToggleButton = eClick.target.closest('.toggle_port_blacklist');

  if (!clickedInsideContainer && !clickedToggleButton) {
    logger.debug('Clicked outside blacklist container - cancelling changes');
    cancelBlacklistChanges();
  }

  // removeDownloadTags('');
}

// ################################################
function toggleVisibleClock(eClick) {
  preventAndStop(eClick);

  toggleDisplayClass(midiBay.menuClockTag, 'visible_clock');

  const isVisible = midiBay.menuClockTag.classList.contains('visible_clock');
  setStorage('WMB_visible_clock', isVisible);

  if (!isVisible) {
    clearClockIndicators();
  }
}

// ################################################
function toggleSignals(eClick) {
  preventAndStop(eClick);

  midiBay.signalsEnabled = !midiBay.signalsEnabled;

  const button = eClick.target;
  // button.textContent = midiBay.signalsEnabled ? 'Visual Signals: ON' : 'Visual Signals: OFF';
  // button.textContent = midiBay.signalsEnabled ? 'on' : 'off';
  toggleDisplayClass(button, 'signals_on', midiBay.signalsEnabled);

  setStorage('WMB_signals_on', midiBay.signalsEnabled);
  logger.debug('toggleSignals', midiBay.signalsEnabled);
}

// ################################################
function clearClockIndicators() {
  removeClassFromAll('.clock_in', 'clock_in');
  removeClassFromAll('.clock_out', 'clock_out');
}

// ################################################
function handleKeyboardShortcuts(eKeydown) {
  // Nur reagieren wenn kein Input-Element fokussiert ist

  if (
    document.activeElement &&
    (document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.contentEditable === 'true')
  ) {
    return;
  }

  const menuButtonsSingle = [
    { key: '1', selector: '#menu li:nth-child(1 of li:not(.visible))  a' },
    { key: '2', selector: '#menu li:nth-child(2 of li:not(.visible)) a' },
    { key: '3', selector: '#menu li:nth-child(3 of li:not(.visible)) a' },
    { key: '4', selector: '#menu li:nth-child(4 of li:not(.visible)) a' },
  ];
  const menuButtonsMulti = [
    { key: '1', selector: '.menu.filter_menu a' },
    { key: '2', selector: '.menu.monitor_menu a' },
    { key: '3', selector: '.menu.sysex_menu a' },
    { key: '4', selector: '.menu.settings_menu a' },
  ];
  const menuButtons = midiBay.elementViewMode === 'single' ? menuButtonsSingle : menuButtonsMulti;

  menuButtons.push({ key: 'x', selector: '#clear_message' });
  menuButtons.push({ key: 'p', selector: '#pause_message' });

  const button = menuButtons.find((b) => b.key === eKeydown.key);

  if (button) {
    logger.debug(`Keyboard shortcut ${button.key} pressed`);
    preventAndStop(eKeydown);

    const element = document.querySelector(button.selector);
    if (element) {
      element.click();
    }
  }
}
