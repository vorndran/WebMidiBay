export { initializeDragLineIfNeeded, calculateDragLinePosition, updateHoverTargetClasses };

import { midiBay } from '../main.js';
import { get_Y_CenterPosition, getDragLine } from '../routing/routingLines.js';
import { removeClassFromAll } from '../html/domClasses.js';

/**
 * Initialisiert die Drag-Line beim ersten Move-Event
 */
function initializeDragLineIfNeeded(event) {
  if (!midiBay.graphTag.dragLine && midiBay.clickedInPortTag) {
    midiBay.clickedInPortTag.classList.add('routing_source');
    midiBay.clickedInPortTag.setPointerCapture(event.pointerId);
    midiBay.graphTag.dragLine = getDragLine(midiBay.clickedInPortTag.id);
  }
}

/**
 * Berechnet die Zielposition für die Drag-Line basierend auf Hover-Target
 */
function calculateDragLinePosition(event_x, event_y) {
  let dragLine_x2 = event_x - midiBay.graphTagRect.left;
  let dragLine_y2 = event_y - midiBay.graphTagRect.top;

  updateHoverTargetClasses(event_x, event_y);

  const routingTarget = document.querySelector('.routing_target');
  if (routingTarget) {
    dragLine_x2 = midiBay.graphTagRect.width;
    dragLine_y2 = get_Y_CenterPosition(routingTarget.id);
  }

  return { x2: dragLine_x2, y2: dragLine_y2 };
}

/**
 * Aktualisiert die CSS-Klassen für Hover-Targets
 */
function updateHoverTargetClasses(event_x, event_y) {
  const hoveredTag = document.elementFromPoint(event_x, event_y);

  if (hoveredTag?.classList.contains('output')) {
    hoveredTag.classList.add('routing_target');
  } else {
    removeClassFromAll('.routing_target', 'routing_target');
  }
}
