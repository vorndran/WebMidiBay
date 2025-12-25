export {
  initHtmlPorts,
  clickedMidiPort,
  setSelectedPort,
  setPortConnectionClass,
  sendTemporaryTextToTag,
};
import { midiBay } from '../main.js';
import { getPortProperties, getPortByTagId } from '../utils/helpers.js';
import { setFilterClass } from '../filter/filterCss.js';
import { setChannelClass } from '../filter/filterChannel.js';
import { renamePortAlias } from './portAlias.js';
import { logger } from '../utils/logger.js';
import { addClass, removeClass, hasClass, toggleClass } from '../html/domUtils.js';
import { setInportRoutingClass, setOutportRoutingClass } from '../routing/routingCssClasses.js';
import { addSelectedPort } from './portSelection.js';
import { togglePortRouting, removeAllRoutingsToOutput } from '../routing/routingToggleRouting.js';
import { storeRoutingOutPortName } from '../storage/storagePort.js';
import { restoreAlias } from './portAlias.js';
import { setText } from '../html/domContent.js';
import { preventAndStop } from '../html/domUtils.js';
import { updateLayout } from '../html/htmlUpdater.js';

// #################################################################
function initHtmlPorts() {
  restoreAlias();
  setHtmlPortProperties();
  appendPortTagsToRoutingLists();
  setPortByTagIdMap();
  setAllPortConnectionClass();
  midiBay.editPortTag = null;
  midiBay.renamePortsFlag = false;
  midiBay.openClosePortsFlag = false;
}
// #################################################################
// #################################################
function setHtmlPortProperties() {
  logger.debug('expand MidiPort');

  // Initialisiere Metadaten für alle Ports
  midiBay.portNameMap.forEach((portNameMap) => {
    let index = 0;

    portNameMap.forEach((port) => {
      const portProperties = getPortProperties(port);
      portProperties.index = ++index;
      portProperties.tag = document.createElement('li');
      portProperties.tagId = `${port.type}_${portProperties.index}`;
      portProperties.tag.id = portProperties.tagId;
      setText(portProperties.tag, portProperties.alias);
    });
  });
}
// #################################################################
// function appendPortTagsToRoutingLists(midiMap, inOrOut) {
function appendPortTagsToRoutingLists() {
  logger.debug('showPorts');

  midiBay.portNameMap.forEach((portMap, type) => {
    const listTag = document.getElementById(`${type}put_list`);

    portMap.forEach((port) => {
      const portProperties = getPortProperties(port);
      const portTag = getPortProperties(port).tag;
      addClass(portTag, `midiport`);
      addClass(portTag, `${type}put`);
      setText(portTag, portProperties.alias);
      listTag.append(portTag);
    });
  });
}
// #################################################################
function setPortByTagIdMap() {
  logger.debug('assignPortTags');

  midiBay.portByTagIdMap = new Map();

  midiBay.portNameMap.forEach((portMap) => {
    portMap.forEach((port) => {
      const portProperties = getPortProperties(port);
      // portProperties.tag = document.getElementById(portProperties.tagId);
      midiBay.portByTagIdMap.set(portProperties.tagId, port);
    });
  });
}
// ##################################################
function clickedMidiPort(eClick) {
  logger.debug('clickedMidiPort', eClick.target.id);
  preventAndStop(eClick);
  switch (true) {
    case midiBay.renamePortsFlag:
      return renamePortAlias(eClick);
    case midiBay.routingEvent:
      return (midiBay.routingEvent = false);
    case midiBay.editPortTag:
      return;
  }

  const clickedPort = getPortByTagId(eClick.target.id);

  if (midiBay.openClosePortsFlag) {
    openCloseMidiPort(clickedPort);
    setPortConnectionClass(clickedPort);
    return;
  }

  if (setPortRouting(midiBay.selectedPort, clickedPort)) return;
  setSelectedPort(clickedPort);
}
// #################################################################
function setSelectedPort(clickedPort) {
  addSelectedPort(clickedPort);
  setFilterClass();
  setChannelClass();
  setInportRoutingClass();
  setOutportRoutingClass();
}
// #################################################
function setPortRouting(selectedPort, clickedPort) {
  logger.debug('setPortRouting');
  if (clickedPort.type == 'output') {
    if (hasClass(midiBay.graphTag, 'routing')) {
      if (!midiBay.selectedPort) {
        // logger.debug('setPortRouting: no selected input port', getPortProperties(clickedPort));
        // showMessage(`<span class="routing">For routing: first select Input!!!</span>`, 'routing');
        const clickedTag = getPortProperties(clickedPort).tag;
        sendTemporaryTextToTag(clickedTag, ' Select Input First!');
        // addClass(clickedTag, 'warning');
        // setText(clickedTag, ' Select Input First!');
        // setTimeout(() => {
        //   setText(clickedTag, getPortProperties(clickedPort).alias);
        //   removeClass(clickedTag, 'warning');
        // }, 2000);
        // logger.debug('setPortRouting: no selected input port - end');
        return true;
      }
      togglePortRouting(selectedPort, clickedPort, storeRoutingOutPortName);
      return true;
    }
  }
  return false;
}
// #################################################
function openCloseMidiPort(port) {
  logger.debug('openCloseMidiPort', port.type, port.name, port.connection);

  if (port.connection == 'open') {
    // Bei Output-Ports: Zuerst alle Routings entfernen, dann Port schließen
    if (port.type === 'output') {
      removeAllRoutingsToOutput(port);
    }
    port.close();
  } else {
    port.open();
  }
}
// #################################################
function setAllPortConnectionClass() {
  //console.log('set All Port ConnectionClass');

  midiBay.portByTagIdMap.forEach((port) => {
    setPortConnectionClass(port);
  });
}
// #################################################
function setPortConnectionClass(port) {
  //console.log('set Port ConnectionClass');

  const meta = getPortProperties(port);
  meta.tag = meta.tag || document.getElementById(meta.tagId);
  toggleClass(meta.tag, 'open', port.connection == 'open');
  return meta.tag;
}
// #################################################
function sendTemporaryTextToTag(tag, warningText, className = 'warning') {
  const originalText = tag.innerHTML;
  addClass(tag, className);
  setText(tag, warningText);
  setTimeout(() => {
    setText(tag, warningText);
    setText(tag, originalText);
    removeClass(tag, className);
  }, 3000);
}
