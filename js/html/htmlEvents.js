/**
 * HTML Event Listener Setup
 *
 * Zentrale Event-Registrierung für die Applikation.
 * Delegiert die Handler-Logik an htmlEventHandlers.js.
 */

export { setEventListener };

import { midiBay } from '../main.js';
import { sendDumpRequest, autoSaveSysex } from '../sysex/sysex.js';
import { clickedMidiPort } from './htmlPorts.js';
import {
  clickedMessage,
  setMsgMonitor_showFiltered,
  setMsgMonitor_showPorts,
  setMsgMonitor_maxVisibleLines,
  setMsgMonitor_messageStringDisplay,
} from './htmlMessage.js';
import { renamePortAlias, renameFile, resetAllAlias } from './htmlAlias.js';
import { resetAllRouting } from '../routing/routingPorts.js';
import { clickedFilter, resetAllFilter } from '../filter/filter.js';
import { clickedChannel } from '../filter/filterChannel.js';
import { getFiles } from './htmlForm.js';

import {
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
} from './htmlEventHandlers.js';
import { updateLayout } from './htmlUpdater.js';

// ################################################
function setEventListener() {
  const clickEvents = {
    a: click,
    input: click,
    button: click,
    '#menu': clickMenu,
    '#file_rename': renameFile,
    'li.midiport': clickedMidiPort,
    'li.filter': clickedFilter,
    'li.channel': clickedChannel,
    '#clear_message': clickedMessage,
    '#pause_message': clickedMessage,
    '.menu.filter_menu a': clickMenu,
    '.menu.monitor_menu a': clickMenu,
    '.menu.routing_menu a': clickMenu,
    '.menu.sysex_menu a': clickMenu,
    '.menu.settings_menu a': clickMenu,
    '.portmenu a': clickedPortMenu,
    '.clock a': toggleVisibleClock,
    '#settings_file_rename': renameSettingsFile,
    '.clear_settings': clearAllStorage,
    '.clear_routing': resetAllRouting,
    '.clear_filter': resetAllFilter,
    '.reset_port_names': resetAllAlias,
    '.toggle_element_view': toggleElementViewMode,
    '.toggle_signals': toggleSignals,
    '.toggle_port_blacklist': togglePortBlacklistUI,
    '.port_blacklist_checkbox': clickedPortBlacklistCheckbox,
    '#apply_blacklist': applyAndReloadBlacklist,
    '#cancel_blacklist': cancelBlacklistChanges,
    '.sysex_file_download': clickDownloadSysexFile,
    '.settings_file_download': clickDownloadSettingsFile,
    '.custom_settings_file_upload': clickSettingsFileUploadInput,
    '.custom_sysex_file_upload': clickSysexFileUploadInput,
    '.sysex_send_dump': sendDumpRequest,
    '.auto_save_sysex': autoSaveSysex,
    body: clickedWindow,
  };

  registerEventListeners('click', clickEvents);
  registerEventListeners('dblclick', { 'li.midiport': renamePortAlias });

  registerChangeListeners();
  registerKeyboardListeners();

  // Layout-Updates bei Fenstergrößenänderung
  window.addEventListener('resize', updateLayout);
} // ################################################
function registerEventListeners(event, events) {
  if (!midiBay.eventElements) midiBay.eventElements = new Set();

  for (const [selector, func] of Object.entries(events)) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.addEventListener(event, func, { passive: false });
      midiBay.eventElements.add(element);
    });
  }
}

// ################################################
function registerChangeListeners() {
  document.getElementById('sysex_file_upload')?.addEventListener('change', getFiles);
  document.getElementById('settings_file_upload')?.addEventListener('change', getFiles);
  document
    .getElementById('filtered_message')
    ?.addEventListener('change', setMsgMonitor_showFiltered);
  document.getElementById('filtered_ports')?.addEventListener('change', setMsgMonitor_showPorts);
  document
    .getElementById('message_linecount')
    ?.addEventListener('change', setMsgMonitor_maxVisibleLines);
  document
    .getElementById('filtered_txt_strings')
    ?.addEventListener('change', setMsgMonitor_messageStringDisplay);
}

// ################################################
function registerKeyboardListeners() {
  document.addEventListener('keydown', handleKeyboardShortcuts);
}
