export {
  clickMenu,
  hideAllMenuItemsExcept,
  toggleElementViewMode,
  toggleVisibleClock,
  toggleSignals,
  toggleSysexCollection,
};

import { setText } from '../html/domContent.js';
import { logger } from '../utils/logger.js';
import { midiBay } from '../main.js';
import { hasClass, toggleClass, removeClassFromAll, preventAndStop } from '../html/domUtils.js';
import { setStorage } from '../storage/storage.js';
import { updateMenuState, applyViewModeRules } from '../html/initHtml.js';
import { updateLayout } from '../html/htmlUpdater.js';
import { toggleAutoCollectSysexAction } from '../sysex/sysexFileActions.js';

// ##############################################
function clickMenu(eClick) {
  const targetId = eClick.target.dataset.menuitem_target_id;
  const menuItemTarget = targetId ? document.getElementById(targetId) : null;
  if (!targetId || !menuItemTarget) return;

  logger.debug('clickMenu: ', targetId, 'mode:', midiBay.elementViewMode);

  if (midiBay.elementViewMode === 'single') {
    hideAllMenuItemsExcept(targetId);
  }

  const isCurrentlyHidden = hasClass(menuItemTarget, 'js-hidden');
  const shouldShow = isCurrentlyHidden;

  updateMenuState(targetId, shouldShow);
  setStorage('WMB_html_visibility', [...midiBay.menuItemVisibleMap]);
}
// ##############################################
function hideAllMenuItemsExcept(exceptId = null) {
  for (const [id, state] of midiBay.menuItemVisibleMap) {
    if (id !== exceptId && state === 'visible') {
      updateMenuState(id, false);
    }
  }
}
// ##############################################
function toggleElementViewMode(eClick) {
  preventAndStop(eClick, true, false);

  midiBay.elementViewMode = midiBay.elementViewMode === 'single' ? 'multi' : 'single';
  setStorage('WMB_element_view_mode', midiBay.elementViewMode);

  setText(eClick.target, `view: ${midiBay.elementViewMode}`);
  eClick.target.dataset.viewMode = midiBay.elementViewMode;

  applyViewModeRules(midiBay.elementViewMode);

  if (midiBay.elementViewMode === 'single') {
    hideAllMenuItemsExcept('settings');
    updateMenuState('settings', true);
    setStorage('WMB_html_visibility', [...midiBay.menuItemVisibleMap]);
  }

  toggleClass(document.querySelector('.container'), 'single', midiBay.elementViewMode === 'single');

  logger.debug('View mode changed to:', midiBay.elementViewMode);
}
// ##############################################
function toggleVisibleClock(eClick) {
  preventAndStop(eClick, true, false);

  toggleClass(midiBay.menuClockTag, 'visible_clock');
  const isVisible = hasClass(midiBay.menuClockTag, 'visible_clock');
  setStorage('WMB_visible_clock', isVisible);

  if (!isVisible) {
    clearClockIndicators();
  }
}
// ##############################################
function toggleSignals(eClick) {
  preventAndStop(eClick, true, false);

  midiBay.signalsEnabled = !midiBay.signalsEnabled;

  const button = eClick.target;
  toggleClass(button, 'signals_on', midiBay.signalsEnabled);

  setStorage('WMB_signals_on', midiBay.signalsEnabled);
  logger.debug('toggleSignals', midiBay.signalsEnabled);
}
// ##############################################
function clearClockIndicators() {
  removeClassFromAll('.clock_in', 'clock_in');
  removeClassFromAll('.clock_out', 'clock_out');
}
// ##############################################
function toggleSysexCollection(event) {
  preventAndStop(event, true, false);
  toggleAutoCollectSysexAction();
}
