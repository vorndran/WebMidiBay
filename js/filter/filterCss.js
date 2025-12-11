export {
  initFilterCss,
  setFilterClass,
  setFilterTagsClass,
  setFilterContainerClass,
  setPortTagFilterClass,
  setFilterPortInfoTagClass,
  restorePortTagFilterClass,
  setSelectedPortTagFilterClass,
};
import { midiBay } from '../main.js';
import {
  getPortProperties,
  removeClasses,
  getSelectedPort,
  getSelectedPortProperties,
} from '../utils/helpers.js';
import { chooseFilterSet } from './filter.js';
import { logger } from '../utils/logger.js';
import { toggleDisplayClass, addClass, removeClass } from '../html/domStyles.js';

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
  setSelectedPortTagFilterClass();
}
// #########################################################
function restorePortTagFilterClass() {
  logger.debug('restorePortTagFilterClass');

  midiBay.portByTagIdMap.forEach((port) => {
    setPortTagFilterClass(port);
  });
}
// #########################################################
function setSelectedPortTagFilterClass() {
  logger.debug('setSelectedPortTagFilterClass');

  if (!midiBay.selectedPort) return;
  setPortTagFilterClass(midiBay.selectedPort);
}
// #########################################################
function setPortTagFilterClass(port) {
  const portProbs = getPortProperties(port);

  portProbs.filterSet.size + portProbs.channel.filter + portProbs.channel.reset > 0
    ? addClass(portProbs.tag, 'filtered')
    : removeClass(portProbs.tag, 'filtered');
}
// ####################################################
// Setzt die Klasse des Filter-Info-Tags -> CSS Darstellung: gewählter Port oder `all inputs`
function setFilterPortInfoTagClass() {
  logger.debug('setFilterPortInfoTagClass');

  const portInfoTagArray = document.querySelectorAll('.filterportinfo');
  const inOrOutTag = document.querySelector('.in-or-out');

  const selectedPortProbs = getSelectedPortProperties();

  portInfoTagArray.forEach((portInfoTag) => {
    // Setze zuerst die CSS-Klasse korrekt
    toggleDisplayClass(portInfoTag, 'chosen', Boolean(selectedPortProbs));

    // Dann bestimme den anzuzeigenden Text basierend auf der Auswahl
    portInfoTag.innerHTML = selectedPortProbs ? selectedPortProbs.alias : `all inputs`;
  });

  // Aktualisiere Input/Output Anzeige
  if (inOrOutTag) {
    inOrOutTag.textContent = selectedPortProbs
      ? selectedPortProbs.type === 'input'
        ? ' (Input)'
        : ' (Output)'
      : '';
  }
}
// ####################################################
// Setzt die Klasse des Filter-Info-Tags -> CSS Darstellung: gewählter Port oder `all inputs`
// function setFilterPortInfoTagClass() {
//   logger.debug('setFilterPortInfoTagClass');

//   const portInfoTagArray = document.querySelectorAll('.filterportinfo');

//   const selectedPort = getSelectedPort();
//   const selectedPortProbs = selectedPort ? getPortProperties(selectedPort) : null;

//   portInfoTagArray.forEach((portInfoTag) => {
//     logger.debug(
//       '%csetFilterPortInfoTagClass',
//       'color: blue;',
//       'selectedPort',
//       selectedPortProbs ? selectedPortProbs.alias : 'none'
//     );

//     portInfoTag.innerHTML = toggleDisplayClass(portInfoTag, 'chosen', selectedPort)
//       ? selectedPortProbs.alias
//       : `all inputs`;
//   });
// }
// ####################################################
// Setzt die Klasse des Filter-Container-Tags auf input oder output Port
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
    filterSet.has(filterTag.dataset.statusbyte) // filter.js
      ? addClass(filterTag, classItem)
      : removeClass(filterTag, classItem);
  });
}
