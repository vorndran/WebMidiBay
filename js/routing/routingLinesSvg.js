export {
  drawRoutingLine,
  drawAllRoutingLines,
  redrawRoutingLines,
  resetGraphTagPosition,
  get_Y_CenterPosition,
  getDragLine,
  getBoundingClientRectArray,
  getRectArrayDiffResult,
};

import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { setText, clearNode } from '../html/domContent.js';
import { setAttributes, createElementWithAttributes } from '../html/domContent.js';
import { getComputedStyleValue, setStyles } from '../html/domStyles.js';
import { routingLinesUnvisible } from './routingLines.js';

// #############################################################
/**
 * Zeichnet alle aktiven Routing-Linien neu.
 * Wird bei Resize oder Routing-Änderungen aufgerufen.
 */
function redrawRoutingLines(forceUpdate = false) {
  if (routingLinesUnvisible()) return;
  // logger.debug('%credrawRoutingLines', 'color: lightblue; font-weight: bold;');

  // Berechne die SVG-Container-Dimensionen neu
  const svgRectArray = getBoundingClientRectArray(midiBay.svgContainerTag);
  const svgRectArrayFormer = midiBay.svgRectArray;
  const svgRectArrayDiff = getRectArrayDiffResult(svgRectArray, svgRectArrayFormer);

  // logger.debug(
  //   '%c SVG Container Rect Array Diff:',
  //   'color: lightblue; font-weight: bold;',
  //   svgRectArrayDiff,
  //   svgRectArray,
  //   svgRectArrayFormer
  // );
  // Wenn sich die Größe nicht geändert hat, keine Aktualisierung notwendig
  if (svgRectArrayDiff == 0 && !forceUpdate) {
    return;
  }
  midiBay.svgRectArray = svgRectArray;

  logger.debug(
    '%c drawAllRoutingLines from redrawRoutingLines',
    'color: lightblue; font-weight: bold;'
  );
  // if (midiBay.svgDimension == allSvgDimensions) return;

  drawAllRoutingLines();
}
// #############################################################
function getBoundingClientRectArray(element) {
  const rect = element.getBoundingClientRect();
  return [rect.left, rect.width, rect.top, rect.height, rect.right, rect.bottom, rect.x, rect.y];
}
// #############################################################
function getRectArrayDiffResult(rectArray1, rectArray2) {
  // logger.debug('getRectArrayDiffResult', rectArray1, rectArray2);
  const arrayDiffResult = rectArray1.map((value, x) => value - rectArray2[x]);
  return arrayDiffResult.reduce((acc, val) => acc + val, 0);
}
/**
 * Zeichnet alle Routing-Verbindungen als SVG-Linien.
 */
function drawAllRoutingLines() {
  // logger.debug('%cdrawAllRoutingLines', 'color: blue; font-weight: bold;');
  if (routingLinesUnvisible()) return;

  clearNode(midiBay.graphTag);
  midiBay.lineMap.clear();
  resetGraphTagPosition();

  midiBay.inNameMap.forEach((inPort) => {
    const inMeta = getPortProperties(inPort);
    inMeta.outPortSet.forEach((outPort) => {
      const outMeta = getPortProperties(outPort);
      const line = drawRoutingLine(inMeta.tagId, outMeta.tagId);

      midiBay.graphTag.appendChild(line);
      midiBay.lineMap.set(line.id, line);
    });
  });
}

// #############################################################
/**
 * Erstellt eine SVG-Linie zwischen zwei Ports.
 * @param {string} inPortTagId - ID des Input-Port-Tags
 * @param {string} outPortTagId - ID des Output-Port-Tags
 * @returns {SVGLineElement} Die erstellte SVG-Linie
 */
function drawRoutingLine(inPortTagId, outPortTagId) {
  // logger.debug('drawRoutingLine', `${inPortTagId}-${outPortTagId}`);

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
  line.classList.add('line');
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
  // logger.debug('resetGraphTagPosition');
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
  // logger.debug('getGraphPositionTags');
  if (routingLinesUnvisible()) return;

  // const inputList = document.getElementById('inputs_list');
  // const outputList = document.getElementById('output_list');

  // midiBay.graphTag.topLeftTag = inputList.firstElementChild;
  // midiBay.graphTag.rightTag = outputList.lastElementChild;
  // midiBay.graphTag.bottomTag =
  // // ermittel die längere Liste:
  //   midiBay.inNameMap.size <= midiBay.outNameMap.size ? outputList.lastElementChild : inputList.lastElementChild;

  const inputList = document.getElementById('inputs');
  const outputList = document.getElementById('outputs');

  midiBay.graphTag.topTag = inputList;
  midiBay.graphTag.leftTag = inputList?.firstElementChild;
  midiBay.graphTag.rightTag = outputList?.lastElementChild;
  midiBay.graphTag.bottomTag =
    // ermittel die längere Liste:
    midiBay.inNameMap.size <= midiBay.outNameMap.size ? outputList : inputList;
}

// ##################################################
/**
 * Erstellt eine Drag-Linie für Drag&Drop-Operationen.
 * @param {string} portTagId - ID des Port-Tags
 * @returns {SVGLineElement} Die erstellte Drag-Linie
 */
function getDragLine(portTagId) {
  // logger.debug('getDragLine');
  const line = drawRoutingLine(portTagId, portTagId);
  line.classList.add('dragline');
  midiBay.graphTag.appendChild(line);
  return line;
}

// ##################################################
