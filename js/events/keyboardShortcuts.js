export { handleKeyboardShortcuts };

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { preventAndStop } from '../html/domUtils.js';

function handleKeyboardShortcuts(eKeydown) {
  if (
    document.activeElement &&
    (document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.contentEditable === 'true')
  ) {
    return;
  }

  if (eKeydown.key === '0' && !eKeydown.ctrlKey && !eKeydown.metaKey && !eKeydown.altKey) {
    preventAndStop(eKeydown);
    location.reload();
    return;
  }

  const menuButtons = getMenuShortcutTargets(midiBay.elementViewMode);
  logger.debug('Menu shortcut targets:', menuButtons);
  const extraButtons = [
    { key: 'x', element: document.querySelector('#clear_message') },
    { key: 'p', element: document.querySelector('#pause_message') },
  ];

  const button = [...menuButtons, ...extraButtons].find((b) => b.key === eKeydown.key);
  if (!button || !button.element) return;

  logger.debug(`Keyboard shortcut ${button.key} pressed`);
  preventAndStop(eKeydown);
  button.element.click();
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
