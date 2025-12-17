export {
  initFilter,
  storeFilter,
  restoreFilter,
  clickedFilter,
  chooseFilterSet,
  resetAllFilter,
  unselectSelectedPort,
};
import { midiBay } from '../main.js';
import {
  getPortProperties,
  getSelectedPortProperties,
  forEachPortWithPortProperties,
} from '../utils/helpers.js';
import { getStorage, setStorage } from '../storage/storage.js';
import { storePortMap, restorePortMap } from '../storage/storagePort.js';
import { logger } from '../utils/logger.js';
import { preventAndStop, toggleDisplayClass } from '../html/domStyles.js';
import { initChannel, setChannelClass, resetAllChannels } from './filterChannel.js';
import { updateAllOutputPortClockWarnings } from '../core/midiMessageSignal.js';
import { MIDI_TIMING_CLOCK } from '../constants/midiConstants.js';
import {
  initFilterCss,
  setFilterTagsClass,
  setFilterPortInfoTagClass,
  setFilterContainerClass,
  restorePortTagFilterClass,
  setFilterCss,
} from './filterCss.js';
import { removeSelectedPort } from '../routing/routingSelectedPort.js';

// ###########################################
function initFilter() {
  midiBay.globalFilterSet = new Set();
  initChannel(); // channelFilter.js
  restoreFilter();
  initFilterCss(); // filterCss.js
}
// ###########################################
function clickedFilter(eClick) {
  logger.debug('clickedFilter');
  preventAndStop(eClick);
  toggleFilter(eClick.target);
  storeFilter();
  setFilterCss(); // filterCss.js
}
// ###########################################
function unselectSelectedPort() {
  logger.debug('unselectSelectedPort');

  if (!midiBay.selectedPort) return;
  const selectedPortProbs = getSelectedPortProperties();
  removeSelectedPort(selectedPortProbs.tag);
  setFilterPortInfoTagClass();
  setFilterContainerClass();
  setFilterTagsClass();
  setChannelClass();
}
// ###########################################
function toggleFilter(clickedFilterTag) {
  logger.debug('toggleFilter', clickedFilterTag.dataset.statusbyte);

  const statusbyte = Number(clickedFilterTag.dataset.statusbyte);
  const filterSet = chooseFilterSet();

  const filterActive = toggleDisplayClass(clickedFilterTag, 'active');
  filterActive ? filterSet.add(statusbyte) : filterSet.delete(statusbyte);

  if (filterSet == midiBay.globalFilterSet) {
    toggleDisplayClass(clickedFilterTag, 'all_active', filterActive);
  }

  // Wenn Clock-Filter geändert wurde, aktualisiere alle Output-Port Warnings
  if (statusbyte === MIDI_TIMING_CLOCK) {
    updateAllOutputPortClockWarnings();
  }
}
// ###########################################
function resetAllFilter(eClick) {
  logger.debug('resetAllFilter');
  preventAndStop(eClick);

  forEachPortWithPortProperties(midiBay.portByTagIdMap, (port, portProbs) => {
    portProbs.filterSet = new Set();
  });
  midiBay.globalFilterSet = new Set();
  storeFilter();
  setFilterTagsClass();
  resetAllChannels();
  restorePortTagFilterClass();
}
// ###########################################
function chooseFilterSet() {
  if (!midiBay.selectedPort) return midiBay.globalFilterSet;
  const portProbs = getSelectedPortProperties();
  logger.debug('chooseFilterSet', portProbs.filterSet);
  return portProbs.filterSet;
}
// ###################################################
function storeFilter() {
  logger.debug('storeFilter', midiBay.globalFilterSet);

  storePortMap('WMB_midi_filter_in', midiBay.inNameMap, 'filterSet');
  storePortMap('WMB_midi_filter_out', midiBay.outNameMap, 'filterSet');
  setStorage('WMB_midi_filter_all', [...midiBay.globalFilterSet]);
}
// ##################################################
function restoreFilter() {
  logger.debug('restoreFilter');

  restorePortMap('WMB_midi_filter_in', midiBay.inNameMap, 'filterSet');
  restorePortMap('WMB_midi_filter_out', midiBay.outNameMap, 'filterSet');
  midiBay.globalFilterSet = new Set(getStorage('WMB_midi_filter_all') || []);
}
