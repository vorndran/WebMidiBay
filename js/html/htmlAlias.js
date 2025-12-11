export { renamePortAlias, isPortNameEdit, restoreAlias, renameFile, resetAllAlias };
import { midiBay } from '../main.js';
import {
  getPortProperties,
  getSelectedPortProperties,
  getSelectedPort,
  getPortByTagId,
} from '../utils/helpers.js';
import { removeStorage } from '../storage/storage.js';
import { storePortMap, restorePortMap } from '../storage/storagePort.js';
import { redrawRoutingLines } from '../routing/routingLines.js';
import { setSelectedPort } from '../html/htmlPorts.js';
import { logger } from '../utils/logger.js';
import { preventAndStop, hide, show } from './domStyles.js';
import { setText } from './domContent.js';

// #################################################################
// store Routing - midiBayRouting in den Speicher laden.
// ###############################################################
function storeAlias() {
  logger.debug('storeAlias');

  storePortMap('WMB_midi_in_port_alias', midiBay.inNameMap, 'alias');
  storePortMap('WMB_midi_out_port_alias', midiBay.outNameMap, 'alias');
}
// ###############################################################
// restore Alias - WMB_midi_port_alias aus dem Speicher laden.
// ###############################################################
function restoreAlias() {
  logger.debug('restoreAlias');

  restorePortMap('WMB_midi_in_port_alias', midiBay.inNameMap, 'alias');
  restorePortMap('WMB_midi_out_port_alias', midiBay.outNameMap, 'alias');
}
// ###############################################################
function resetAllAlias(eClick) {
  preventAndStop(eClick);
  removeStorage('WMB_midi_in_port_alias');
  removeStorage('WMB_midi_out_port_alias');
  location.reload();
}
// ###############################################################
// restore Alias - WMB_midi_port_alias aus dem Speicher laden.
// ###############################################################
function renamePortAlias(eClick) {
  logger.debug('renamePortAlias');
  hide(midiBay.graphTag);
  // eClick.stopPropagation();
  const clickedPortTag = eClick.target;
  if (midiBay.editPortTag == clickedPortTag) return;
  // compare the selected port's portProperties.tag to the click target
  const selTag = getSelectedPortProperties().tag;
  if (selTag != eClick.target) setSelectedPort(getPortByTagId(eClick.target.id));
  midiBay.editPortTag = eClick.target;
  midiBay.editPortTag.addEventListener('focusout', editPortTagFocusOut);
  midiBay.editPortTag.addEventListener('keydown', blurByEnter);
  midiBay.editPortTag.contentEditable = 'true';
  midiBay.editPortTag.focus();
}
// ###############################################################
function editPortTagFocusOut() {
  logger.debug('editPortTagFocusOut');
  show(midiBay.graphTag); // CSS-native Sichtbarkeit
  if (!midiBay.editPortTag) return;
  midiBay.editPortTag.removeEventListener('focusout', editPortTagFocusOut);
  midiBay.editPortTag.removeEventListener('keydown', blurByEnter);
  midiBay.editPortTag.contentEditable = 'false';
  const port = getPortByTagId(midiBay.editPortTag.id);
  getPortProperties(port).alias = event.target.textContent;
  midiBay.editPortTag = null;
  redrawRoutingLines();
  storeAlias();
}
// ###############################################################
function blurByEnter(eKey) {
  logger.debug('blurByEnter');

  if (eKey.code == 'Escape') {
    const port = getPortByTagId(midiBay.editPortTag.id);
    setText(midiBay.editPortTag, getPortProperties(port).alias);
    midiBay.editPortTag.blur();
    show(midiBay.graphTag); // CSS-native Sichtbarkeit
  }
  if (eKey.code == 'Enter') {
    midiBay.editPortTag.blur();
    show(midiBay.graphTag); // CSS-native Sichtbarkeit
  }
}
// ###############################################################
function isPortNameEdit(eClick) {
  logger.debug('isPortNameEdit');

  if (midiBay.editPortTag) {
    eClick.stopPropagation();
    if (midiBay.editPortTag) return true;
    midiBay.editPortTag.contentEditable = 'false';

    return true;
  }
  return false;
}
// ###############################################################
function renameFile(eClick) {
  logger.debug('renameFile');

  const clickedTag = eClick.target;
  if (midiBay.editFileTag == clickedTag) return;
  // if (midiBay.selectedPort?.tag != eClick.target) setSelectedPort(midiBay.portByTagIdMap.get(eClick.target.id));
  // unselectSelectedPort();
  midiBay.editFileTag = eClick.target;
  midiBay.editFileTag.addEventListener('focusout', editRenameFileFocusOut);
  midiBay.editFileTag.addEventListener('keydown', blurFileByEnter);
  midiBay.editFileTag.contentEditable = 'true';
  midiBay.editFileTag.focus();
}
// ###############################################################
function editRenameFileFocusOut(event) {
  logger.debug('editRenameFileFocusOut', event.target.id);

  event.target.removeEventListener('focusout', editRenameFileFocusOut);
  event.target.contentEditable = 'false';
  // midiBay.portByTagIdMap.get(event.target.id).alias = event.target.innerText;
  // const fileDownloadTag = document.getElementById('file_download');
  // fileDownloadTag.download = event.target.innerText + '.json';
  midiBay.editFileTag = null;
  redrawRoutingLines();
  storeAlias();
}
// ###############################################################
function blurFileByEnter(eKey) {
  logger.debug('blurFileByEnter');

  if (eKey.code == 'Escape') {
    // midiBay.editFileTag.innerText = fileDownloadTag.download.replace('.json', '');
    midiBay.editFileTag.blur();
  }
  if (eKey.code == 'Enter') {
    //console.log('blur By Enter', eKey.code);
    // const sendEvent = new Object({ target: midiBay.editFileTag });
    midiBay.editFileTag.blur();
    //console.log('blur By Enter', sendEvent);
    // editRenameFileFocusOut(sendEvent);
  }
}
