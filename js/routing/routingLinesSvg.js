export { drawRoutingLine, get_Y_CenterPosition, resetGraphTagPosition, routingLinesUnvisible };

import { midiBay } from '../main.js';
import { setStyles, getComputedStyleValue } from '../html/domUtils.js';
import { addClass } from '../html/domUtils.js';

// #############################################################
/**
 * Erstellt eine SVG-Linie zwischen zwei Ports.
 * @param {string} inPortTagId - ID des Input-Port-Tags
 * @param {string} outPortTagId - ID des Output-Port-Tags
 * @returns {SVGLineElement} Die erstellte SVG-Linie
 */
function drawRoutingLine(inPortTagId, outPortTagId) {
  midiBay.graphTagRect = midiBay.graphTag.getBoundingClientRect();

  const svgNS = 'http://www.w3.org/2000/svg';
  const line = document.createElementNS(svgNS, 'line');

  const inY = get_Y_CenterPosition(inPortTagId);
  const outY = get_Y_CenterPosition(outPortTagId);

  line.setAttribute('x1', '0');
  line.setAttribute('y1', inY.toString());
  line.setAttribute('x2', midiBay.graphTagRect.width.toString());
  line.setAttribute('y2', outY.toString());
  line.setAttribute('id', `${inPortTagId}-${outPortTagId}`);
  addClass(line, 'line');
  line.dataset.input = inPortTagId;
  line.dataset.output = outPortTagId;

  return line;
}

// ##################################################
/**
 * Berechnet die vertikale Mittelposition eines Port-Tags relativ zum Graph.
 * @param {string} portTagId - ID des Port-Tags
 * @returns {number} Y-Position in Pixeln
 */
function get_Y_CenterPosition(portTagId) {
  const portRect = document.getElementById(portTagId).getBoundingClientRect();
  const topYPos = portRect.top - midiBay.graphTagRect.top;
  const midYPos = topYPos + portRect.height / 2;
  return midYPos;
}

// ##################################################
/**
 * Aktualisiert Position und Größe des SVG-Graph-Containers.
 */
function resetGraphTagPosition() {
  if (routingLinesUnvisible()) return;

  getGraphPositionTags();

  // Null-Safety für Test-Umgebung
  if (
    !midiBay.graphTag.topTag ||
    !midiBay.graphTag.leftTag ||
    !midiBay.graphTag.rightTag ||
    !midiBay.graphTag.bottomTag
  ) {
    return;
  }

  const top = midiBay.graphTag.topTag.getBoundingClientRect().top + window.scrollY;
  const left = midiBay.graphTag.leftTag.getBoundingClientRect().right + window.scrollX;
  const right = midiBay.graphTag.rightTag.getBoundingClientRect().left + window.scrollX;
  const bottom = midiBay.graphTag.bottomTag.getBoundingClientRect().bottom + window.scrollY;

  setStyles(midiBay.graphTag, {
    top: `${top}px`,
    left: `${left}px`,
    width: `${right - left}px`,
    height: `${bottom - top}px`,
  });
}

// ##################################################
/**
 * Ermittelt die Referenz-Tags für die Graph-Positionierung.
 */
function getGraphPositionTags() {
  if (routingLinesUnvisible()) return;

  const inputList = document.getElementById('inputs');
  const outputList = document.getElementById('outputs');

  midiBay.graphTag.topTag = inputList;
  midiBay.graphTag.leftTag = inputList?.firstElementChild;
  midiBay.graphTag.rightTag = outputList?.lastElementChild;
  // Determine the longer list for bottom boundary
  midiBay.graphTag.bottomTag =
    midiBay.inNameMap.size <= midiBay.outNameMap.size ? outputList : inputList;
}

// ##################################################
/**
 * Prüft, ob Routing-Linien unsichtbar sind.
 * @returns {boolean} True, wenn Routing-Container ausgeblendet ist
 */
function routingLinesUnvisible() {
  return getComputedStyleValue('#routing_lines', 'display') === 'none';
}
// ##################################################
