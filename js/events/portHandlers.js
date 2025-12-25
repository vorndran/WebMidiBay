export {
  click,
  clickedPortMenu,
  clickDownloadSysexFile,
  clickDownloadSettingsFile,
  clickedUnselectSelectedPort,
  renameSettingsFile,
  clearAllStorage,
  clickSettingsFileUploadInput,
  clickSysexFileUploadInput,
  clickedWindow,
  togglePortBlacklistUI,
  clickedPortBlacklistCheckbox,
  applyAndReloadBlacklist,
  cancelBlacklistChanges,
};

import { logger } from '../utils/logger.js';
import { hasClass, preventAndStop } from '../html/domUtils.js';
import { unselectSelectedPort } from '../filter/filter.js';
import { clearStorage } from '../storage/storage.js';
import { downloadSettingsFile, downloadSysexFile } from '../html/htmlForm.js';
import {
  clickedPortMenuRename,
  clickedPortMenuOpenClose,
  clickedPortMenuRouting,
  resetPortMenuFunctions,
  setPortMenuActive,
  getPortMenuAction,
} from '../ports/portMenu.js';
import {
  togglePortBlacklistUI,
  clickedPortBlacklistCheckbox,
  applyAndReloadBlacklist,
  cancelBlacklistChanges,
} from '../ports/portBlacklist.js';

function click(eClick) {
  logger.debug('click', eClick.target.id || eClick.target.className);
  // stopPropagation() entfernt - Event muss zum globalen Listener bubblen für updateLayout()
}

function clickedPortMenu(eClick) {
  const menuElement = eClick.target.parentElement;
  const action = getPortMenuAction(menuElement);
  logger.debug('clickedPortMenu: ', action);

  preventAndStop(eClick);
  resetPortMenuFunctions();

  if (!setPortMenuActive(menuElement)) return;

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
      break;
  }
}

function clickDownloadSysexFile(eClick) {
  logger.debug('clickDownloadSysexFile');
  preventAndStop(eClick);
  downloadSysexFile();
}

function clickDownloadSettingsFile(eClick) {
  logger.debug('clickDownloadSettingsFile');
  preventAndStop(eClick);
  downloadSettingsFile();
}

function clickedUnselectSelectedPort(eClick) {
  logger.debug('clickedUnselectSelectedPort');
  preventAndStop(eClick);
  unselectSelectedPort();
}

function renameSettingsFile(eClick) {
  eClick.target.addEventListener('keydown', blurOnEnterOrEscape);
  eClick.target.addEventListener('focusout', editSettingsFocusOut);
}

function blurOnEnterOrEscape(eKey) {
  logger.debug('blurOnEnterOrEscape');
  if (eKey.code == 'Escape' || eKey.code == 'Enter') {
    eKey.target.blur();
  }
}

function editSettingsFocusOut(eFocusout) {
  logger.debug('edit Settings Focus Out!');
  eFocusout.target.removeEventListener('keydown', blurOnEnterOrEscape);
  eFocusout.target.removeEventListener('focusout', editSettingsFocusOut);
}

function clearAllStorage() {
  clearStorage();
  location.reload();
}

function clickSettingsFileUploadInput(eClick) {
  preventAndStop(eClick);
  document.getElementById('settings_file_upload').click();
}

function clickSysexFileUploadInput(eClick) {
  preventAndStop(eClick);
  document.getElementById('sysex_file_upload').click();
  logger.debug('clickSysexFileUploadInput');
}

function clickedWindow(eClick) {
  logger.debug(`clicked Window Event`);

  const blacklistContainer = document.querySelector('.port_blacklist_container');
  if (!blacklistContainer || hasClass(blacklistContainer, 'js-hidden')) {
    return;
  }

  const clickedInsideContainer = blacklistContainer.contains(eClick.target);
  const clickedToggleButton = eClick.target.closest('.toggle_port_blacklist');

  if (!clickedInsideContainer && !clickedToggleButton) {
    logger.debug('Clicked outside blacklist container - cancelling changes');
    cancelBlacklistChanges();
  }
}
