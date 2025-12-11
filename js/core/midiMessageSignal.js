export { signal, lineSignal };

import { midiBay } from '../main.js';
import { getPortProperties } from '../utils/helpers.js';
import { routingLinesUnvisible } from '../routing/routingLines.js';
import { addClass, removeClass } from '../html/domStyles.js';
import { hasClass } from '../html/domClasses.js';
import { logger } from '../utils/logger.js';

let timingClockStillActive = false;
const signalInPortTagSet = new Set();
const signalOutPortTagSet = new Set();
const signalPortTagMap = { in: signalInPortTagSet, out: signalOutPortTagSet };
const clockSignalPortTagSet = new Set();

// ################################################
function lineSignal(inOrOut, statusByte, inPort, outPort) {
  const inPortProbs = getPortProperties(inPort);
  const outPortProbs = getPortProperties(outPort);
  const lineTagId = `${inPortProbs.tagId}-${outPortProbs.tagId}`;
  signal(inOrOut, statusByte, outPort, lineTagId);
}

// ################################################
function signal(inOrOut, statusByte, port, lineTagId) {
  const portProbs = getPortProperties(port);

  // wenn es ein Clock- oder Active Sensing Signal ist -> Icon permanent setzen:
  if (statusByte == 248 || statusByte == 254) {
    if (
      (portProbs.type === 'input' && inOrOut === 'in') ||
      (portProbs.type === 'output' && inOrOut === 'out')
    )
      clockAndActiveSensingSignal(portProbs, statusByte); // Permanente clock_active Klasse
  }

  // Early exit: Visual Signals deaktiviert ###################################################
  if (!midiBay.signalsEnabled) return;

  // wenn es ein Clock- oder Active Sensing Signal ist -> blinkendes Signal:
  if (statusByte == 248 || statusByte == 254) {
    clockAndActiveSensingSignalBlinks(portProbs.tag, inOrOut); // Blinkendes Signal
    return;
  }

  // wenn das Port-Tag schon im Set ist, dann kein neues Signal starten:
  if (signalPortTagMap[inOrOut].has(portProbs.tagId)) return;
  // die tag.id von prtTags mit Signalen wird in einem Set gesammelt, damit sie nicht mehrfach ein Signal bekommen:
  signalPortTagMap[inOrOut].add(portProbs.tagId);

  const signal = inOrOut == 'in' ? 'insignal' : 'outsignal';

  // Die CSS Klasse für das Port-Signal hinzufügen:
  if (hasClass(portProbs.tag, signal)) return; // Schutz, falls Klasse schon da ist1^
  addClass(portProbs.tag, signal);
  // Die CSS Klasse für das Linien-Signal hinzufügen, falls Linie existiert und sichtbar:
  if (lineTagId && !routingLinesUnvisible()) addClass(midiBay.lineMap.get(lineTagId), 'signal');

  setTimeout(() => {
    signalPortTagMap[inOrOut].delete(portProbs.tagId);
    removeClass(portProbs.tag, signal);
    // removeClass ist safe auch wenn Linie nicht mehr existiert/sichtbar
    if (lineTagId) removeClass(midiBay.lineMap.get(lineTagId), 'signal');
  }, 400);
}

// #########################################################
function clockAndActiveSensingSignal(portProbs, statusByte) {
  const isClock = statusByte === 248;
  const timestampKey = isClock ? 'clockTimestamp' : 'activeSensingTimestamp';
  const timerKey = isClock ? 'clockTimer' : 'activeSensingTimer';
  const cssClass = isClock ? 'clock_active' : 'active_sensing_active';

  // Aktualisiere entsprechenden Timestamp
  portProbs[timestampKey] = Date.now();

  // Wenn es ein Output-Port ist, prüfe auf multiple Clock-Quellen (nur für Clock)
  if (isClock && portProbs.type === 'output') {
    trackOutputClockSources(portProbs);
  }

  // Wenn bereits ein Timer läuft: Aktualisiere nur Timestamp und return
  if (portProbs[timerKey]) return;

  logger.debug(`Starte ${timerKey} für ${portProbs.tagId}`);

  // Markiere Port als aktiv (nur beim ersten Mal)
  addClass(portProbs.tag, cssClass);

  // Rekursive Prüfung: Läuft alle 1s und prüft ob Messages noch kommen
  const checkActive = () => {
    if (Date.now() - portProbs[timestampKey] >= 1000) {
      // Keine Messages mehr seit 1s → Entferne Klasse
      removeClass(portProbs.tag, cssClass);
      portProbs[timerKey] = null;

      // Wenn es Clock auf Output-Port ist, aktualisiere Clock-Source-Tracking
      if (isClock && portProbs.type === 'output') {
        trackOutputClockSources(portProbs);
      }
    } else {
      // Messages kommen noch → Prüfe erneut in 1s
      portProbs[timerKey] = setTimeout(checkActive, 1000);
    }
  };

  // Starte erste Prüfung in 1s
  portProbs[timerKey] = setTimeout(checkActive, 1000);
}

// #########################################################
/**
 * Überwacht Output-Ports auf mehrere Clock-Quellen.
 * Zählt wie viele Input-Ports aktiv Clock-Signale an diesen Output senden.
 * Fügt CSS-Klasse 'multiple_clock_sources' hinzu wenn mehr als eine Quelle aktiv ist.
 *
 * @param {Object} outPortProbs - Port-Properties des Output-Ports
 */
function trackOutputClockSources(outPortProbs) {
  if (!outPortProbs.inPortSet) return; // Kein Routing vorhanden

  let activeClockSources = 0;

  // Zähle wie viele Input-Ports aktiv Clock senden
  outPortProbs.inPortSet.forEach((inPort) => {
    const inPortProbs = getPortProperties(inPort);
    if (inPortProbs.clockTimer) {
      activeClockSources++;
    }
  });

  // Nur DOM ändern wenn Status sich ändert (Performance-Optimierung)
  const hasWarning = hasClass(outPortProbs.tag, 'multiple_clock_sources');
  const shouldWarn = activeClockSources > 1;

  if (shouldWarn && !hasWarning) {
    addClass(outPortProbs.tag, 'multiple_clock_sources');
  } else if (!shouldWarn && hasWarning) {
    removeClass(outPortProbs.tag, 'multiple_clock_sources');
  }
}

// #########################################################
function clockAndActiveSensingSignalBlinks(portTag, inOrOut) {
  // Port bekommt ein clock-Signal
  // alle portTag, die ein clock-Signal bekommen, werden in einem Set gesammelt
  clockSignalPortTagSet.add({ tagId: portTag.id, direction: inOrOut });
  if (timingClockStillActive) return;

  const clockTag = midiBay.menuClockTag;

  addClass(clockTag, `clock_signal`);

  if (hasClass(clockTag, 'visible_clock'))
    // um bei Anfang des Signals die jeweilige Klasse hinzuzufügen:
    clockSignalPortTagSet.forEach((entry) => toggleClockClass(entry, true));

  timingClockStillActive = true;
  setTimeout(() => {
    removeClass(clockTag, `clock_signal`);

    if (hasClass(clockTag, 'visible_clock'))
      // um bei Ende des Signals die jeweilige Klasse wieder zu entfernen:
      clockSignalPortTagSet.forEach((entry) => toggleClockClass(entry, false));
    clockSignalPortTagSet.clear();

    setTimeout(() => {
      timingClockStillActive = false;
    }, 1000);
  }, 1000);
}
// #####################################################
// Hilfsfunktion für clockAndActiveSensingSignalBlinks():
// Fügt oder entfernt die Clock-Klasse für einen Port
function toggleClockClass(entry, add = true) {
  const portTag = document.getElementById(entry.tagId);
  if (!portTag) return;
  const className = `clock_${entry.direction}`;
  add ? addClass(portTag, className) : removeClass(portTag, className);
}
// #####################################################
