/**
 * Message Monitor - Core Logic
 * Queue Management + Rendering + Message Processing
 */

export { showMidiMessageAsText, showMessage, renderVisibleMessages, updateVisibleMessages };

import { midiBay } from '../main.js';
import { getPortProperties, getSelectedPort } from '../utils/helpers.js';
import { addClass } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import { setTagInnerHTML, clearInnerHTML } from '../html/domContent.js';
import { getBoundingClientRectArray, getRectArrayDiffResult } from '../routing/routingLines.js';

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
  // Cache selected port once for performance (called multiple times per message)
  const selectedPort = getSelectedPort();

  // Filter messages based on visibility settings
  const visibleMessages = midiBay.msgMonitor.messageQueue.filter((msg) => {
    // Filter for filtered/unfiltered messages
    if (midiBay.msgMonitor.showFiltered === 'filtered' && msg.filtered !== 'filtered') return false;
    if (midiBay.msgMonitor.showFiltered === 'unfiltered' && msg.filtered !== 'sended') return false;
    // Filter for port types
    if (!isMsgOfPortType(msg, selectedPort)) return false;
    // All checks passed - show message
    return true;
  });

  fillWithEmptyMessages(visibleMessages, midiBay.msgMonitor.maxVisibleLines);

  // Take only the FIRST X visible messages
  const messagesToRender = visibleMessages.slice(0, midiBay.msgMonitor.maxVisibleLines);

  // Rebuild DOM completely
  clearInnerHTML(midiBay.msgTag);

  renderMessages(messagesToRender, selectedPort);
}
// ########################################################
function isMsgOfPortType(msg, selectedPort) {
  switch (midiBay.msgMonitor.showPorts) {
    case 'inputs':
      return msg.portType === 'input';
    case 'outputs':
      return msg.portType === 'output';
    case 'selection':
      if (!selectedPort) return true;
      return msg.portName === selectedPort.name && msg.portType === selectedPort.type;
    case 'all':
    default:
      return true;
  }
}
// ########################################################
function renderMessages(messagesToRender, selectedPort) {
  let oddOrEven = 'odd';
  messagesToRender.forEach((msg) => {
    const isSelected =
      selectedPort && msg.portName === selectedPort.name && msg.portType === selectedPort.type;
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
