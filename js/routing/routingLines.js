export {
  initRoutingLines,
  drawAllRoutingLines,
  redrawRoutingLines,
  getBoundingClientRectArray,
  getRectArrayDiffResult,
};

import { midiBay } from '../main.js';
import { logger } from '../utils/logger.js';
import {
  drawRoutingLine,
  resetGraphTagPosition,
  routingLinesUnvisible,
} from './routingLinesSvg.js';
import { getPortProperties } from '../utils/helpers.js';
import { clearInnerHTML } from '../html/domContent.js';
// ################################################################
function initRoutingLines() {
  midiBay.lineMap = new Map();
  midiBay.graphTag = document.getElementById('graph');
  midiBay.svgContainerTag = document.querySelector('div.container');
  midiBay.svgDimension = null;
  midiBay.svgRectArray = [0, 0, 0, 0, 0, 0, 0, 0];
  // Vereinfachter Sichtbarkeitsstatus statt spezifischer Display-Werte
  midiBay.graphTag.graphDisplay = 'visible';
  redrawRoutingLines();
}
// #############################################################
/**
 * Zeichnet alle aktiven Routing-Linien neu.
 * Wird bei Resize oder Routing-Änderungen aufgerufen.
 */
function redrawRoutingLines(forceUpdate = false) {
  if (routingLinesUnvisible()) return;

  // Recalculate SVG container dimensions
  const svgRectArray = getBoundingClientRectArray(midiBay.svgContainerTag);
  const svgRectArrayFormer = midiBay.svgRectArray;
  const svgRectArrayDiff = getRectArrayDiffResult(svgRectArray, svgRectArrayFormer);

  // If size hasn't changed, no update needed
  if (svgRectArrayDiff == 0 && !forceUpdate) {
    return;
  }
  midiBay.svgRectArray = svgRectArray;

  logger.debug(
    '%c drawAllRoutingLines from redrawRoutingLines',
    'color: lightblue; font-weight: bold;'
  );

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

// #############################################################
/**
 * Zeichnet alle Routing-Verbindungen als SVG-Linien.
 */
function drawAllRoutingLines() {
  if (routingLinesUnvisible()) return;

  clearInnerHTML(midiBay.graphTag);
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
