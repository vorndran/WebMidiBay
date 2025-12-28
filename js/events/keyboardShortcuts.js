/**
 * Keyboard Shortcuts Handler
 *
 * Tastenkombinationen:
 * - Cmd+0 (macOS) / Ctrl+0 (Windows/Linux): Seite neu laden
 * - Cmd+1-4 (macOS) / Ctrl+1-4 (Windows/Linux): Menü-Navigation
 * - Cmd+x (macOS) / Ctrl+x (Windows/Linux): Monitor leeren
 * - Cmd+p (macOS) / Ctrl+p (Windows/Linux): Monitor pausieren
 */
export { handleKeyboardShortcuts };

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { preventAndStop } from '../html/domUtils.js';
import { scheduleLayoutUpdate } from '../html/htmlUpdater.js';

function handleKeyboardShortcuts(eKeydown) {
  // Ignore shortcuts when typing in input fields
  if (
    document.activeElement &&
    (document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.contentEditable === 'true')
  ) {
    return;
  }

  // Check for required modifier key (Cmd on macOS, Ctrl on Windows/Linux)
  const hasModifier = eKeydown.metaKey || eKeydown.ctrlKey;
  if (!hasModifier) {
    return; // No modifier pressed, ignore shortcut
  }

  // Additional check: Prevent Alt combinations (reserved for browser/OS)
  if (eKeydown.altKey) {
    return;
  }

  // Reload page: Cmd/Ctrl+0
  if (eKeydown.key === 'r') {
    preventAndStop(eKeydown, true, false);
    location.reload();
    return;
  }

  // Menu shortcuts (1-4) and extra buttons (x, p)
  const menuButtons = getMenuShortcutTargets(midiBay.elementViewMode);
  logger.debug('Menu shortcut targets:', menuButtons);
  const extraButtons = [
    { key: 'x', element: document.querySelector('#clear_message') },
    { key: 'p', element: document.querySelector('#pause_message') },
  ];

  const button = [...menuButtons, ...extraButtons].find((b) => b.key === eKeydown.key);
  if (!button || !button.element) return;

  logger.debug(`Keyboard shortcut Cmd/Ctrl+${button.key} pressed`);
  preventAndStop(eKeydown, true, false);
  button.element.click();

  // Trigger layout update after successful shortcut execution
  scheduleLayoutUpdate();
}

function getMenuShortcutTargets(viewMode) {
  const menuShortcutsSingle = [
    { key: '1', selector: '#menu li:nth-child(1 of li:not(.visible))  a' },
    { key: '2', selector: '#menu li:nth-child(2 of li:not(.visible)) a' },
    { key: '3', selector: '#menu li:nth-child(3 of li:not(.visible)) a' },
    { key: '4', selector: '#menu li:nth-child(4 of li:not(.visible)) a' },
  ];
  logger.debug('getMenuShortcutTargets viewMode:', menuShortcutsSingle);
  const menuShortcutsMulti = [
    { key: '1', selector: '[data-menuitem_target_id="filter"]' },
    { key: '2', selector: '[data-menuitem_target_id="monitor"]' },
    { key: '3', selector: '[data-menuitem_target_id="sysex"]' },
    { key: '4', selector: '[data-menuitem_target_id="settings"]' },
  ];
  const shortcuts = viewMode === 'single' ? menuShortcutsSingle : menuShortcutsMulti;

  return shortcuts.map(({ key, selector }) => {
    return { key, element: document.querySelector(selector) };
  });
}
