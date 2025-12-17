export {
  initHtmlMessage,
  showMidiMessageAsText,
  showMessage,
  clickedMessage,
  setMsgMonitor_showFiltered,
  setMsgMonitor_showPorts,
  renderVisibleMessages,
  updateVisibleMessages,
  setMsgMonitor_maxVisibleLines,
  setMessageContainerClass,
  setMsgMonitor_messageStringDisplay,
};

import { showDumpButton } from './htmlForm.js';
import { midiBay } from '../main.js';
import { getPortProperties, getSelectedPort, removeClasses } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { insertPrependLimited, setTagInnerHTML } from './domContent.js';
import { addClass, preventAndStop, toggleDisplayClass } from './domStyles.js';
import { updateLayout } from './htmlUpdater.js';
import { getBoundingClientRectArray, getRectArrayDiffResult } from '../routing/routingLinesSvg.js';
// ##########################################################################
function initHtmlMessage() {
  logger.debug('initHtmlMessage');
  midiBay.sysexMessage = [];
  midiBay.sysExWasSent = true;
  midiBay.collectingSysEx = false;
  initMsgMonitor();
  initMessageClasses();
  showDumpButton();
}
// ########################################################
function showMidiMessageAsText(midiMessage, midiDataText, port) {
  const portAlias = getPortProperties(port).alias;
  const filtered = midiMessage.isFiltered ? 'filtered' : 'sended';
  const message = `<span class="portname ${port.type} ${filtered}">${portAlias}</span> ${midiDataText}`;
  showMessage(message, filtered, port.type, port.name);
}
// ########################################################
function showMessage(message, isFiltered, portType, portName) {
  if (midiBay.msgMonitor.paused) return;

  const maxQueueSize = midiBay.msgMonitor.maxQueueSize;

  // 1. Alle 'empty'-Nachrichten entfernen
  midiBay.msgMonitor.messageQueue = midiBay.msgMonitor.messageQueue.filter(
    (msg) => msg.filtered !== 'empty'
  );

  // 2. Neue echte Nachricht am ANFANG einfügen
  midiBay.msgMonitor.messageQueue.unshift({
    html: message,
    filtered: isFiltered,
    portType: portType,
    portName: portName,
    timestamp: Date.now(),
    isEmpty: false,
  });

  // 3. Queue ggf. begrenzen (älteste echte Nachricht entfernen)
  if (midiBay.msgMonitor.messageQueue.length > maxQueueSize) {
    midiBay.msgMonitor.messageQueue.pop();
  }

  // 4. Mit 'empty' Nachrichten am Ende auffüllen (Helferfunktion)
  fillWithEmptyMessages(midiBay.msgMonitor.messageQueue, maxQueueSize);
  // 5. DOM neu rendern, wenn Monitor sichtbar ist (throttled via requestAnimationFrame)
  if (midiBay.menuItemVisibleMap.get('monitor') === 'none') return;
  scheduleRender();
}
// ########################################################
// Performance: Throttle DOM updates using requestAnimationFrame
function scheduleRender() {
  if (!midiBay.msgMonitor.renderScheduled) {
    midiBay.msgMonitor.renderScheduled = true;
    requestAnimationFrame(() => {
      renderVisibleMessages();
      updateLayout();
      midiBay.msgMonitor.renderScheduled = false;
    });
  }
}
// ########################################################
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
// ########################################################
function renderVisibleMessages() {
  // Filter messages based on visibility settings
  const visibleMessages = midiBay.msgMonitor.messageQueue.filter((msg) => {
    // Filter for filtered/unfiltered messages
    if (midiBay.msgMonitor.showFiltered === 'filtered' && msg.filtered !== 'filtered') return false;
    if (midiBay.msgMonitor.showFiltered === 'unfiltered' && msg.filtered !== 'sended') return false;
    // Filter for port types
    switch (midiBay.msgMonitor.showPorts) {
      case 'inputs':
        if (msg.portType !== 'input') return false;
        break;
      case 'outputs':
        if (msg.portType !== 'output') return false;
        break;
      case 'selection':
        if (!msg.portName) {
          logger.debug(
            '%Cfilter selected port: !msg.portName ',
            'color: orange; font-weight: bold;',
            msg,
            ' - selectedPort.name',
            getSelectedPort() ? getSelectedPort().name : 'no selected port'
          );
        }
        const selectedPort = getSelectedPort();
        if (!selectedPort) return true;
        if (selectedPort && msg.portName !== selectedPort.name) return false;
        if (msg.portType !== selectedPort.type) return false;
        break;
      // 'all' or unknown: no filter
    }
    return true;
  });
  fillWithEmptyMessages(visibleMessages, midiBay.msgMonitor.maxVisibleLines);

  // Take only the FIRST X visible messages
  const displayMessages = visibleMessages.slice(0, midiBay.msgMonitor.maxVisibleLines);

  // Rebuild DOM completely
  midiBay.msgTag.innerHTML = '';
  let oddOrEven = 'odd';

  displayMessages.forEach((msg) => {
    const isSelected = getSelectedPort() && msg.portName === getSelectedPort().name ? true : false;
    const pTag = document.createElement('p');
    setTagInnerHTML(pTag, msg.html);
    addClass(pTag, msg.filtered, msg.portType, oddOrEven);
    if (isSelected) addClass(pTag, 'selected');
    oddOrEven = oddOrEven === 'odd' ? 'even' : 'odd';
    midiBay.msgTag.appendChild(pTag);
  });
}

// ########################################################
function updateVisibleMessages(forceUpdate = false) {
  if (forceUpdate) renderVisibleMessages();
  // Check if message container size has changed
  const messageRectArray = getBoundingClientRectArray(midiBay.msgTag);
  const messageRectArrayFormer = midiBay.messageRectArray;
  const messageRectArrayDiff = getRectArrayDiffResult(messageRectArray, messageRectArrayFormer);

  // If size hasn't changed, no update needed
  if (messageRectArrayDiff == 0) {
    return;
  }
  midiBay.messageRectArray = messageRectArray;

  logger.debug(
    '%cupdateVisibleMessages: render visible messages!',
    'color: pink; font-weight: bold;'
  );
  renderVisibleMessages();
}
// ########################################################
function initMsgMonitor() {
  logger.debug('%cinitMsgMonitor', 'color: purple; font-weight: bold;');
  midiBay.msgMonitor = {};
  midiBay.msgTag = document.getElementById('message_text');
  midiBay.msgTag.oddOrEven = 'odd';
  midiBay.msgMonitor.paused = false;
  midiBay.msgMonitor.renderScheduled = false;
  midiBay.msgMonitor.messageStringDisplay = 'text'; // text | raw | both
  midiBay.messageRectArray = [0, 0, 0, 0, 0, 0, 0, 0];

  midiBay.msgMonitor.showPorts = 'inputs'; // inputs | outputs | all | selection
  midiBay.msgMonitor.showFiltered = 'all'; // all | filtered | unfiltered
  midiBay.msgMonitor.isLoop = false;
  // Message Queue System
  midiBay.msgMonitor.messageQueue = [];
  midiBay.msgMonitor.maxQueueSize = 500;
  midiBay.msgMonitor.maxVisibleLines = 30;

  // Initial render
  renderVisibleMessages();

  const selectedMsg = document.getElementById('filtered_message').options[0];
  selectedMsg.selected = true;
  midiBay.msgMonitor.showFiltered = selectedMsg.value;

  const selectedPort = document.getElementById('filtered_ports').options[0];
  selectedPort.selected = true;
  midiBay.msgMonitor.showPorts = selectedPort.value;
}
// ########################################################
// Sets the filter container tag CSS class to input or output port
function initMessageClasses() {
  addClass(midiBay.msgTag, 'message-text');
  midiBay.monitorTag = document.getElementById('monitor');
  setMessageContainerClass();
}
// ####################################################
function setMessageContainerClass() {
  logger.debug('setMessageContainerClass');
  if (!midiBay.monitorTag) return;
  removeClasses(midiBay.monitorTag, [
    'filtered-all',
    'filtered-selection',
    'filtered-inputs',
    'filtered-outputs',
  ]);

  addClass(midiBay.monitorTag, `filtered-${midiBay.msgMonitor.showPorts}`);
}
// ########################################################
function clickedMessage(eClick) {
  logger.debug('clickedMessage');
  preventAndStop(eClick);

  if (eClick.target == document.getElementById('clear_message')) {
    midiBay.msgMonitor.messageQueue = []; // Clear queue
    fillWithEmptyMessages(midiBay.msgMonitor.messageQueue, midiBay.msgMonitor.maxQueueSize);
    return updateLayout(true);
  }
  if (eClick.target == document.getElementById('pause_message')) {
    midiBay.msgMonitor.paused = !midiBay.msgMonitor.paused;
    toggleDisplayClass(eClick.target, 'paused', midiBay.msgMonitor.paused);
    return;
  }
}
// ##################################################
function setMsgMonitor_showPorts(eChanged) {
  logger.debug('setMsgMonitor_showPorts', eChanged.target.value);
  midiBay.msgMonitor.showPorts = eChanged.target.value;

  // Re-render queue for new filter
  setMessageContainerClass();
  updateLayout(true);
}
// ##################################################
function setMsgMonitor_showFiltered(eChanged) {
  logger.debug('setMsgMonitor_showFiltered', eChanged.target.value);

  midiBay.msgMonitor.showFiltered = eChanged.target.value;

  removeClasses(midiBay.msgTag, ['filtered', 'unfiltered']);

  if (midiBay.msgMonitor.showFiltered === 'unfiltered') {
    midiBay.msgTag.classList.add('unfiltered');
  } else if (midiBay.msgMonitor.showFiltered === 'filtered') {
    midiBay.msgTag.classList.add('filtered');
  }

  // Re-render queue for new filter
  updateLayout(true);
}
// ##################################################
function setMsgMonitor_maxVisibleLines(eChanged) {
  logger.debug('setMsgMonitor_maxVisibleLines', eChanged.target.value);

  midiBay.msgMonitor.maxVisibleLines = eChanged.target.value;

  updateLayout(true);
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
