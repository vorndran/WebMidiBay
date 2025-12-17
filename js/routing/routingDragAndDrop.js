export { initDragAndDrop };
import { midiBay } from '../main.js';
import { getPortProperties, getPortByTagId } from '../utils/helpers.js';
import { routingLinesUnvisible } from '../routing/routingLines.js';
import { togglePortRouting } from '../routing/routingPorts.js';
import { setSelectedPort } from '../html/htmlPorts.js';
import { removeClassFromAll } from '../html/domClasses.js';
import { setAttributes } from '../html/domContent.js';
import { removeClass } from '../html/domStyles.js';
import { logger } from '../utils/logger.js';
import { getEventCoordinates, getEvent_xy } from './dragEventUtils.js';
import { preventSelect } from './dragSelectUtils.js';
import {
  initializeDragLineIfNeeded,
  calculateDragLinePosition,
  updateHoverTargetClasses,
} from './dragLineUtils.js';

// ########################################################
function initDragAndDrop() {
  logger.debug('initDragAndDrop');
  midiBay.inNameMap.forEach((inPort) => {
    midiBay.portPropertiesManager
      .getPortProperties(inPort)
      .tag.addEventListener('pointerdown', routingEventStart, { passive: false });
    midiBay.routingEvent = false;
  });
}
// ########################################################
function routingEventStart(event) {
  logger.debug('routingEventStart', event.pointerId, event.isPrimary);

  if (routingLinesUnvisible()) return;
  event.stopPropagation();
  if (midiBay.graphTag.classList.contains('routing')) return;
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
  event.preventDefault();
  midiBay.routingEvent = true;

  initializeDragLineIfNeeded(event);

  const { x: event_x, y: event_y } = getEventCoordinates(event);
  const { x2: dragLine_x2, y2: dragLine_y2 } = calculateDragLinePosition(event_x, event_y);

  setAttributes(midiBay.graphTag.dragLine, { x2: dragLine_x2, y2: dragLine_y2 });
}

// ########################################################
function routingEventEnd(event) {
  logger.debug('routingEventEnd', event.type);

  event.preventDefault();

  setEventListener(event);

  if (!midiBay.graphTag.dragLine) return;

  if (midiBay.selectedPort) {
    const selectedPortProbs = midiBay.portPropertiesManager.getPortProperties(midiBay.selectedPort);
    if (selectedPortProbs.tag != event.target) setSelectedPort(getPortByTagId(event.target.id));
  }

  midiBay.graphTag.dragLine.remove();
  midiBay.graphTag.dragLine = null;

  const eventXyMap = getEvent_xy(event);
  const endTarget = document.elementFromPoint(eventXyMap.get('x'), eventXyMap.get('y'));
  removeClass(midiBay.clickedInPortTag, 'routing_source');
  removeClassFromAll('.routing_target', 'routing_target');

  if (endTarget?.classList.contains('output'))
    togglePortRouting(getPortByTagId(midiBay.clickedInPortTag.id), getPortByTagId(endTarget.id));

  midiBay.clickedInPortTag = null;
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

// #############################################################################
