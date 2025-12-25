export { renamePortAlias, isPortNameEdit, restoreAlias, resetAllAlias };
import { midiBay } from '../main.js';
import { getPortProperties, getSelectedPortProperties, getPortByTagId } from '../utils/helpers.js';
import { removeStorage } from '../storage/storage.js';
import { storePortMap, restorePortMap } from '../storage/storagePort.js';
import { redrawRoutingLines } from '../routing/routingLines.js';
import { setSelectedPort } from './portInteraction.js';
import { logger } from '../utils/logger.js';
import { preventAndStop, hide, show } from '../html/domUtils.js';
import { setText } from '../html/domContent.js';

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

  const clickedPortTag = eClick.target;
  if (midiBay.editPortTag == clickedPortTag) return;
  // compare the selected port's portProperties.tag to the click target
  const selTag = getSelectedPortProperties().tag;
  if (selTag != eClick.target) setSelectedPort(getPortByTagId(eClick.target.id));
  midiBay.editPortTag = eClick.target;
  // Inline-Listener sind hier bewusst lokal, da sie nur während des Edit-Modus aktiv sind
  midiBay.editPortTag.addEventListener('focusout', editPortTagFocusOut);
  midiBay.editPortTag.addEventListener('keydown', blurByEnter);
  midiBay.editPortTag.contentEditable = 'true';
  midiBay.editPortTag.focus();
}
// ###############################################################
function editPortTagFocusOut(event) {
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
