/**
 * sysexSendAndToggles.js - MIDI Output Functions
 *
 * Pure MIDI sending functionality without UI dependencies.
 * Toggle actions moved to sysexFileActions.js to avoid circular dependency.
 */

export { sendSysexFileDataToSelectedOutput };

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import { sendTemporaryTextToTag } from '../ports/portInteraction.js';

// ##############################################
/**
 * Sends SysEx array to selected MIDI output port.
 * @param {Array<number>} sysexArray - SysEx data to send
 */
function sendSysexFileDataToSelectedOutput(sysexArray) {
  logger.debug('send Sysex File Data To Selected Output');
  const sysexfileHead = document.querySelector('.sysexfile_head');

  if (!midiBay.selectedPort || midiBay.selectedPort.type === 'input') {
    sendTemporaryTextToTag(sysexfileHead, ' No Output Selected!');
    return;
  }

  try {
    if (midiBay.selectedPort.state === 'connected') {
      midiBay.selectedPort.send(sysexArray);
      const infoText = ` Sent ${sysexArray.length} bytes of SysEx to ${midiBay.selectedPort.name}`;
      sendTemporaryTextToTag(sysexfileHead, infoText, 'success');
      logger.debug('SysEx sent successfully to', midiBay.selectedPort.name);
    } else {
      const infoText = ` Cannot send Sysex: Port ${midiBay.selectedPort.name} is ${midiBay.selectedPort.state}`;
      sendTemporaryTextToTag(sysexfileHead, infoText, 'warning');
      logger.warn(`${infoText}`);
    }
  } catch (error) {
    logger.error(`Error sending SysEx to ${midiBay.selectedPort.name}:`, error.message);
  }
}
