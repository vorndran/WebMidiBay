/**
 * Message Settings - UI Controls & Event Handlers
 * Handles user interactions with message display settings
 */

export {
  clickedMessage,
  setMessageContainerClass,
  setMsgMonitor_showPorts,
  setMsgMonitor_showFiltered,
  setMsgMonitor_maxVisibleLines,
  setMsgMonitor_messageStringDisplay,
};

import { midiBay } from '../main.js';
import { addClass, toggleClass, removeClasses } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import { preventAndStop } from '../html/domUtils.js';
import { renderVisibleMessages } from './messageMonitor.js';

// ########################################################
function clickedMessage(eClick) {
  logger.debug('clickedMessage');
  preventAndStop(eClick, true, false); // Nur preventDefault, kein stopPropagation

  if (eClick.target == document.getElementById('clear_message')) {
    midiBay.msgMonitor.messageQueue = []; // Clear queue
    fillWithEmptyMessages(midiBay.msgMonitor.messageQueue, midiBay.msgMonitor.maxQueueSize);
    renderVisibleMessages();
    return;
  }
  if (eClick.target == document.getElementById('pause_message')) {
    midiBay.msgMonitor.paused = !midiBay.msgMonitor.paused;
    toggleClass(eClick.target, 'paused', midiBay.msgMonitor.paused);
    return;
  }
}
// ##################################################
// Helper: Re-use fillWithEmptyMessages logic from messageMonitor
function fillWithEmptyMessages(queue, maxQueueSize) {
  while (queue.length < maxQueueSize) {
    queue.push({
      html: `<span class="portname empty">!${queue.length}</span> <span class="rawdata">empty - placeholder for line height calculation</span>`,
      filtered: 'empty',
      portType: 'empty',
      portName: 'empty',
      timestamp: 0,
      isEmpty: true,
    });
  }
  return queue;
}
// ##################################################
function setMsgMonitor_showPorts(eChanged) {
  logger.debug('setMsgMonitor_showPorts', eChanged.target.value);
  midiBay.msgMonitor.showPorts = eChanged.target.value;

  // Re-render queue for new filter
  setMessageContainerClass();
  renderVisibleMessages();
}
// ####################################################
function setMessageContainerClass() {
  logger.debug('setMessageContainerClass');
  // monitorTag ist garantiert vorhanden (wird in initHtml() erstellt)
  removeClasses(midiBay.monitorTag, [
    'filtered-all',
    'filtered-selection',
    'filtered-inputs',
    'filtered-outputs',
  ]);

  addClass(midiBay.monitorTag, `filtered-${midiBay.msgMonitor.showPorts}`);
}

// ##################################################
function setMsgMonitor_showFiltered(eChanged) {
  logger.debug('setMsgMonitor_showFiltered', eChanged.target.value);

  midiBay.msgMonitor.showFiltered = eChanged.target.value;

  removeClasses(midiBay.msgTag, ['filtered', 'unfiltered']);

  if (midiBay.msgMonitor.showFiltered === 'unfiltered') {
    addClass(midiBay.msgTag, 'unfiltered');
  } else if (midiBay.msgMonitor.showFiltered === 'filtered') {
    addClass(midiBay.msgTag, 'filtered');
  }

  // Re-render queue for new filter
  renderVisibleMessages();
}
// ##################################################
function setMsgMonitor_maxVisibleLines(eChanged) {
  logger.debug('setMsgMonitor_maxVisibleLines', eChanged.target.value);

  midiBay.msgMonitor.maxVisibleLines = Number(eChanged.target.value);
  // Note: renderVisibleMessages + scheduleLayoutUpdate automatisch durch updateLayout (via Change-Listener)
}

// ####################################################
function setMsgMonitor_messageStringDisplay(eChanged) {
  logger.debug('setMsgMonitor_messageStringDisplay', eChanged.target.value);
  midiBay.msgMonitor.messageStringDisplay = eChanged.target.value;
  removeClasses(midiBay.msgTag, ['message-text', 'message-raw', 'message-both']);

  switch (midiBay.msgMonitor.messageStringDisplay) {
    case 'text':
      addClass(midiBay.msgTag, 'message-text');
      break;
    case 'raw':
      addClass(midiBay.msgTag, 'message-raw');
      break;
    case 'both':
      addClass(midiBay.msgTag, 'message-both');
      break;
  }
}
