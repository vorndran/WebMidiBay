export {
  initFilterCss,
  setFilterClass,
  setFilterTagsClass,
  setFilterContainerClass,
  setPortTagFilterClass,
  setFilterPortInfoTagClass,
  restorePortTagFilterClass,
  setFilterCss,
};
import { midiBay } from '../main.js';
import { getPortProperties, getSelectedPort, getSelectedPortProperties } from '../utils/helpers.js';

import { chooseFilterSet } from './filter.js';
import { logger } from '../utils/logger.js';
import { addClass, removeClass, toggleClass, removeClasses } from '../html/domUtils.js';
import { setText } from '../html/domContent.js';

// ###########################################
function initFilterCss() {
  logger.debug('initFilterCss');
  midiBay.divFilterTag = document.getElementById('filter');
  midiBay.divFilterTag.classFilterTags = midiBay.divFilterTag.querySelectorAll('.filter');

  setFilterTagsClass();
  setFilterPortInfoTagClass();
  setFilterContainerClass();
  restorePortTagFilterClass();
}
// ############################################################
function setFilterClass() {
  logger.debug('setFilterClass');

  setFilterTagsClass();
  setFilterPortInfoTagClass();
  setFilterContainerClass();
  setFilterCss();
}
// #########################################################
function restorePortTagFilterClass() {
  logger.debug('restorePortTagFilterClass');

  midiBay.portByTagIdMap.forEach((port) => {
    setPortTagFilterClass(port);
  });
}
// #########################################################
function setFilterCss() {
  logger.debug('setFilterCss');

  midiBay.portByTagIdMap.forEach((port) => {
    setPortTagFilterClass(port);
  });
}
// #########################################################
function setPortTagFilterClass(port) {
  logger.debug('setPortTagFilterClass');
  const portProbs = getPortProperties(port);

  portProbs.filterSet.size +
    portProbs.channel.filter +
    portProbs.channel.reset +
    midiBay.globalFilterSet.size +
    midiBay.globalChannel.filter +
    midiBay.globalChannel.reset >
  0
    ? addClass(portProbs.tag, 'filtered')
    : removeClass(portProbs.tag, 'filtered');
}
// ####################################################
// Sets the CSS class of the filter info tag to display selected port or 'all inputs'
function setFilterPortInfoTagClass() {
  logger.debug('setFilterPortInfoTagClass');

  const portInfoTag = document.querySelector('.filterportinfo');
  const inOrOutTag = document.querySelector('.in-or-out');

  const selectedPortProbs = getSelectedPortProperties();

  if (portInfoTag) {
    // Set CSS class correctly first
    toggleClass(portInfoTag, 'chosen', Boolean(selectedPortProbs));

    // Then determine the text to display based on selection
    const portInfoText = selectedPortProbs ? selectedPortProbs.alias : `all inputs`;
    setText(portInfoTag, portInfoText);
  }

  // Update Input/Output display
  if (inOrOutTag) {
    const inOrOutTagText = selectedPortProbs
      ? selectedPortProbs.type === 'input'
        ? ' (Input)'
        : ' (Output)'
      : '';
    setText(inOrOutTag, inOrOutTagText);
  }
}
// ####################################################
// Sets the filter container tag CSS class to input or output port
function setFilterContainerClass() {
  logger.debug('setFilterContainerClass');

  removeClasses(midiBay.divFilterTag, ['selected-input', 'selected-output']);
  removeClasses(midiBay.monitorTag, ['selected-input', 'selected-output']);

  const selectedPort = getSelectedPort();
  if (selectedPort) {
    const portType = `selected-${selectedPort.type}`;
    addClass(midiBay.monitorTag, portType);
    addClass(midiBay.divFilterTag, portType);
  }
}

// ####################################################
function setFilterTagsClass() {
  logger.debug('setFilterTagsClass');

  const filterSet = chooseFilterSet();
  scanFilterSetToFilterTags(filterSet, 'active');

  scanFilterSetToFilterTags(midiBay.globalFilterSet, 'all_active');
}
// ####################################################
function scanFilterSetToFilterTags(filterSet, classItem) {
  midiBay.divFilterTag.classFilterTags.forEach((filterTag) => {
    filterSet.has(Number(filterTag.dataset.statusbyte))
      ? addClass(filterTag, classItem)
      : removeClass(filterTag, classItem);
  });
}
