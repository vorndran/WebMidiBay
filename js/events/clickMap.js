export { clickEvents, changeEvents };

import { toggleAutoDownloadSysexAction } from '../sysex/sysexFileActions.js';
import { clickedMidiPort } from '../ports/portInteraction.js';
import {
  clickedMessage,
  setMsgMonitor_showFiltered,
  setMsgMonitor_showPorts,
  setMsgMonitor_maxVisibleLines,
  setMsgMonitor_messageStringDisplay,
} from '../html/htmlMessage.js';
import { renamePortAlias, resetAllAlias } from '../ports/portAlias.js';
import { resetAllRouting } from '../routing/routingPorts.js';
import { clickedFilter, resetAllFilter } from '../filter/filter.js';
import { clickedChannel } from '../filter/filterChannel.js';
import { getFiles } from '../html/htmlForm.js';
import {
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
} from './portHandlers.js';

import {
  clickMenu,
  toggleVisibleClock,
  toggleElementViewMode,
  toggleSignals,
  toggleSysexCollection,
} from './menuHandlers.js';

// Zentrales Mapping für Click-Events
const clickEvents = {
  input: click,
  button: click,
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
  '.auto_download_sysex': toggleAutoDownloadSysexAction,
  '.toggle_sysex_collection': toggleSysexCollection,
  body: clickedWindow,
};

// Zentrales Mapping für Change-Events
const changeEvents = {
  '#sysex_file_upload': getFiles,
  '#settings_file_upload': getFiles,
  '#filtered_message': setMsgMonitor_showFiltered,
  '#filtered_ports': setMsgMonitor_showPorts,
  '#message_linecount': setMsgMonitor_maxVisibleLines,
  '#filtered_txt_strings': setMsgMonitor_messageStringDisplay,
};
