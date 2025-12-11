export { initChannel, clickedChannel, setChannelClass, storeChannels, resetAllChannels };
import { midiBay } from '../main.js';
import * as storage from '../storage/storage.js';
import * as storagePort from '../storage/storagePort.js';
import { logger } from '../utils/logger.js';
import { getPortProperties } from '../utils/helpers.js';
import { setPortTagFilterClass } from '../filter/filterCss.js';

import { removeClassFromAll } from '../html/domClasses.js';
import { preventAndStop, addClass, removeClass } from '../html/domStyles.js';
// ###########################################
function initChannel() {
  // midiBay.divChannelTag = document.getElementById('channel');
  midiBay.channelTagMap = {};
  midiBay.channelTagMap.filter = new Map();
  midiBay.channelTagMap.reset = new Map();
  midiBay.globalChannel = new Object({ filter: 0, reset: 0 });

  document.querySelectorAll('.channel_filter').forEach((tag) => {
    midiBay.channelTagMap.filter.set(Number(tag.dataset.channelvalue), tag);
  });
  document.querySelectorAll('.channel_reset').forEach((tag) => {
    midiBay.channelTagMap.reset.set(Number(tag.dataset.channelvalue), tag);
  });
  // document.getElementById('channel').addEventListener('click', clickedChannel);
  restoreChannels();
  setGlobalChannelClass();
}
// ###########################################
function clickedChannel(eClick) {
  logger.debug('clickedChannel');
  preventAndStop(eClick);

  setSelectedChannel(eClick.target);
  if (!midiBay.selectedPort) {
    setGlobalChannelClass();
    return;
  }

  setPortTagFilterClass(midiBay.selectedPort);
}
// ###########################################
function setSelectedChannel(channelTag) {
  logger.debug('setSelectedChannel');

  const tagChannelType = channelTag.dataset.channeltype;
  const tagChannelValue = Number(channelTag.dataset.channelvalue);

  let portChannelValue = 0;

  portChannelValue = getSelectedChannel()[tagChannelType];
  getSelectedChannel()[tagChannelType] = tagChannelValue;

  if (tagChannelValue == portChannelValue) return;

  storeChannels();
  // setChannelSpanClass();
  setChannelClass();
}

// ###########################################
function setChannelClass() {
  // entferne alle Class:
  removeClassFromAll('.selected_channel', 'selected_channel');
  addChannelClass();
}
// ###########################################
function addChannelClass() {
  logger.debug('addChannelClass');

  ['filter', 'reset'].map((channelType) => {
    const chValue = getSelectedChannel()[channelType];
    const ChTag = midiBay.channelTagMap[channelType].get(chValue);
    addClass(ChTag, 'selected_channel');
  });
}
// ###########################################
function storeChannels() {
  logger.debug('storeChannels');
  storagePort.storePortMap('WMB_channel_out', midiBay.outNameMap, 'channel');
  storagePort.storePortMap('WMB_channel_in', midiBay.inNameMap, 'channel');
  storage.setStorage('WMB_channel_global', midiBay.globalChannel);
}
// ###########################################
function restoreChannels() {
  logger.debug('restoreChannels');

  storagePort.restorePortMap('WMB_channel_out', midiBay.outNameMap, 'channel');
  storagePort.restorePortMap('WMB_channel_in', midiBay.inNameMap, 'channel');

  const storedGlobalChannel = storage.getStorage('WMB_channel_global');
  midiBay.globalChannel = storedGlobalChannel
    ? new Object(storedGlobalChannel)
    : new Object({ filter: 0, reset: 0 });

  setChannelClass();
}
// ###########################################
function resetAllChannels() {
  logger.debug('resetAllChannels');

  // Reset channel information in the portProperties store and keep port shortcuts
  midiBay.portByTagIdMap.forEach((port) => {
    const portProbs = getPortProperties(port);
    portProbs.channel = { filter: 0, reset: 0 };
  });
  midiBay.globalChannel = new Object({ filter: 0, reset: 0 });
  storeChannels();
  setChannelClass();
  setGlobalChannelClass();
}
// ###########################################
function getSelectedChannel() {
  logger.debug('getSelectedChannel');

  // Prefer reading channel from the central portProperties store.
  // Keep globalChannel as fallback when no port is selected.
  if (midiBay.selectedPort) {
    const portProbs = getPortProperties(midiBay.selectedPort);
    return portProbs.channel;
  }
  return midiBay.globalChannel;
}
// ###################################################
function setGlobalChannelClass() {
  logger.debug('setGlobalChannelClass');

  ['filter', 'reset'].map((channelType) => {
    const isChValueTag = document.querySelector(`.channel_${channelType}.all_active`);
    const chValue = midiBay.globalChannel[channelType];
    const chTag = midiBay.channelTagMap[channelType].get(chValue);
    if (chTag == isChValueTag) return;
    removeClass(isChValueTag, 'all_active');
    addClass(chTag, 'all_active');
  });
}
