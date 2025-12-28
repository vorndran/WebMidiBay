/**
 * HTML Message - Entry Point & Bootstrap
 * Initializes message monitor system
 */

export { initHtmlMessage };

import { showDumpButton } from '../html/htmlForm.js';
import { midiBay } from '../main.js';
import { addClass } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import { renderVisibleMessages } from './messageMonitor.js';
import { setMessageContainerClass } from './messageSettings.js';

// ##########################################################################
// Init & Bootstrap
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
