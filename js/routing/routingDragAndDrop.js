export { initDragAndDrop };
import { midiBay } from '../main.js';
import { getPortByTagId, getSelectedPortProperties } from '../utils/helpers.js';
import { togglePortRouting } from './routingToggleRouting.js';
import { storeRoutingOutPortName } from '../storage/storagePort.js';
import { setSelectedPort } from '../ports/portInteraction.js';

import { removeClass, hasClass, removeClassFromAll } from '../html/domUtils.js';
import { setAttributes } from '../html/domContent.js';
import { preventAndStop } from '../html/domUtils.js';
import { logger } from '../utils/logger.js';
import {
  preventSelect,
  initializeDragLineIfNeeded,
  calculateDragLinePosition,
} from './routingDragUtils.js';
import { routingLinesUnvisible } from './routingLinesSvg.js';

// ########################################################
function initDragAndDrop() {
  logger.debug('initDragAndDrop');
  midiBay.inNameMap.forEach((inPort) => {
    // Drag-Start bleibt lokal registriert, da er nur im Routing-Modus relevant ist
    midiBay.portPropertiesManager
      .getPortProperties(inPort)
      .tag.addEventListener('pointerdown', routingEventStart, { passive: false });
    midiBay.routingEvent = false;
  });
}
// ########################################################
function routingEventStart(event) {
  logger.debug('routingEventStart', event.pointerId, event.isPrimary);

  // Früher Check: Lasse Events auf contentEditable Elementen durch (Port-Umbenennung)
  if (event.target.contentEditable === 'true' || event.target.isContentEditable) {
    return; // Erlaubt native Cursor-Positionierung und Textbearbeitung
  }

  if (routingLinesUnvisible()) return;
  preventAndStop(event, true, false); // Only stopPropagation
  if (hasClass(midiBay.graphTag, 'routing')) return;
  if (midiBay.editPortTag) return;
  if (event.isPrimary == false) return;
  midiBay.routingEvent = false;
  midiBay.graphTag.dragLine = null;
  midiBay.clickedInPortTag = event.target;

  setEventListener(event);
  preventSelect(event);
}
// ########################################################
function routingEventMove(event) {
  logger.debug('routingEventMove');

  if (routingLinesUnvisible()) return;
  preventAndStop(event, false, true); // Only preventDefault
  midiBay.routingEvent = true;

  initializeDragLineIfNeeded(event);

  const { x: event_x, y: event_y } = getEventCoordinates(event);
  const { x2: dragLine_x2, y2: dragLine_y2 } = calculateDragLinePosition(event_x, event_y);

  setAttributes(midiBay.graphTag.dragLine, { x2: dragLine_x2, y2: dragLine_y2 });
}

// ########################################################
function setEventListener(event) {
  switch (event.type) {
    case 'pointerdown':
      midiBay.clickedInPortTag.addEventListener('pointermove', routingEventMove, {
        passive: false,
      });
      midiBay.clickedInPortTag.addEventListener('pointerup', routingEventEnd, { passive: false });
      break;
    case 'pointerup':
      midiBay.clickedInPortTag.removeEventListener('pointermove', routingEventMove);
      midiBay.clickedInPortTag.removeEventListener('pointerup', routingEventEnd);
      break;
  }
}
// ########################################################
function routingEventEnd(event) {
  logger.debug('routingEventEnd', event.type);

  preventAndStop(event, false, true); // Only preventDefault

  setEventListener(event);

  if (!midiBay.graphTag.dragLine) return;

  const selectedPortProbs = getSelectedPortProperties();
  if (selectedPortProbs && selectedPortProbs.tag != event.target) {
    setSelectedPort(getPortByTagId(event.target.id));
  }

  midiBay.graphTag.dragLine.remove();
  midiBay.graphTag.dragLine = null;

  const eventXyMap = getEvent_xy(event);
  const endTarget = document.elementFromPoint(eventXyMap.get('x'), eventXyMap.get('y'));
  removeClass(midiBay.clickedInPortTag, 'routing_source');
  removeClassFromAll('.routing_target', 'routing_target');

  if (endTarget && hasClass(endTarget, 'output')) {
    togglePortRouting(
      getPortByTagId(midiBay.clickedInPortTag.id),
      getPortByTagId(endTarget.id),
      storeRoutingOutPortName
    );
  }

  midiBay.clickedInPortTag = null;
}
// #############################################################################
/**
 * Extrahiert X/Y-Koordinaten aus dem Event
 */
function getEventCoordinates(event) {
  const eventXyMap = getEvent_xy(event);
  return {
    x: eventXyMap.get('x'),
    y: eventXyMap.get('y'),
  };
}

// #############################################################################
/**
 * Normalisiert Event-Koordinaten für verschiedene Event-Typen
 */
function getEvent_xy(event) {
  let event_x;
  let event_y;
  switch (event.type) {
    case 'pointermove':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'pointerup':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'mousemove':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'mouseup':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'touchmove':
      event_x = event.touches[0]?.pageX - window.scrollX;
      event_y = event.touches[0]?.pageY - window.scrollY;
      break;
    case 'touchend':
      event_x = event.changedTouches[0]?.pageX - window.scrollX;
      event_y = event.changedTouches[0]?.pageY - window.scrollY;
      break;
  }
  return new Map([
    ['x', event_x],
    ['y', event_y],
  ]);
}
