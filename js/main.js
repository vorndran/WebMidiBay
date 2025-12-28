'use strict';

export { midiBay };
import { receiveMIDIMessage } from './messageReceiver.js';
import { initFilter } from './filter/filter.js';
import { initRouting } from './routing/routingPorts.js';
import { initHtml, showMidiAccessStateChange } from './html/initHtml.js';
import { PortPropertiesManager } from './portProperties.js';
import { logger } from './utils/logger.js';
import { getNameMap, getFilteredNameMap } from './ports/portBlacklist.js';
import { addClass } from './html/domUtils.js';

/**
 * Zentrales State-Objekt der Applikation
 * Enthält alle globalen Zustände, Port-Maps und Manager-Instanzen
 *
 * @property {PortPropertiesManager} portPropertiesManager - Verwaltet Metadaten für alle MIDI-Ports
 * @property {Map} sysexFileMap - Geladene SysEx-Dateien
 * @property {Array<number>} sysexMessage - Aktuell gesammelte SysEx-Daten
 * @property {Object} dumpRequestObj - SysEx Dump Request Konfiguration
 * @property {boolean} signalsEnabled - Globaler Toggle für visuelle Signal-Feedbacks
 * @property {Set<string>} portBlacklist - Ausgeblendete Port-Namen
 *
 * Dynamisch hinzugefügte Properties während Initialisierung:
 * @property {Map<string, MIDIInput>} allInNameMap - Alle Input-Ports (ungefiltert, für Blacklist-UI)
 * @property {Map<string, MIDIOutput>} allOutNameMap - Alle Output-Ports (ungefiltert, für Blacklist-UI)
 * @property {Map<string, MIDIInput>} inNameMap - Aktive Input-Ports (gefiltert)
 * @property {Map<string, MIDIOutput>} outNameMap - Aktive Output-Ports (gefiltert)
 * @property {Map<string, Map>} portNameMap - Map mit 'in'/'out' → Port-Maps
 * @property {Map<string, MIDIPort>} portByTagIdMap - TagID → Port Lookup
 * @property {Set<number>} globalFilterSet - Globale MIDI-Filter (Status-Bytes)
 * @property {Object} globalChannel - Globale Channel-Filter/Reset {filter: 0, reset: 0}
 * @property {MIDIPort|null} selectedPort - Aktuell ausgewählter Port
 * @property {Map<string, SVGLineElement>} lineMap - Routing-Linien (LineID → SVG-Element)
 * @property {SVGElement} graphTag - SVG-Container für Routing-Linien
 * @property {DOMRect} graphTagRect - Bounds des SVG-Containers
 * @property {HTMLElement} msgTag - Message-Text Container
 * @property {HTMLElement} monitorTag - Monitor Container
 * @property {HTMLElement} menuClockTag - Clock Menu Button
 * @property {Map<string, string>} menuItemVisibleMap - Sichtbarkeitsstatus von Menü-Items
 * @property {Object} msgMonitor - Monitor-State {paused, showPorts, showFiltered, messageQueue, ...}
 * @property {Array<number>} messageRectArray - Cached Bounds für Message-Container
 * @property {Array<number>} svgRectArray - Cached Bounds für SVG-Container
 * @property {boolean} collectingSysEx - Flag: SysEx wird gerade gesammelt
 * @property {boolean} sysExWasSent - Flag: SysEx wurde bereits gesendet
 * @property {boolean} autoDownloadSysex - Flag: Auto-Download von empfangenen SysEx
 * @property {HTMLElement|null} editPortTag - Aktuell bearbeitetes Port-Tag
 * @property {boolean} renamePortsFlag - Flag: Rename-Modus aktiv
 * @property {boolean} openClosePortsFlag - Flag: Open/Close-Modus aktiv
 * @property {boolean} routingEvent - Flag: Routing-Drag-Event aktiv
 * @property {HTMLElement|null} clickedInPortTag - Geklicktes Input-Port-Tag für Drag&Drop
 * @property {Map<string, Object>} channelTagMap - Channel-Filter UI Tags {filter: Map, reset: Map}
 */
const midiBay = {
  portPropertiesManager: new PortPropertiesManager(),
  sysexFileMap: new Map(),
  sysexMessage: [],
  dumpRequestObj: {},
  signalsEnabled: true, // Global Flag für Visual Signals
  portBlacklist: new Set(),
  autoCollectSysex: false, // Auto-collect SysEx messages (independent of monitor visibility)
};

// ################################
// ########## Start ###############
// ################################
(function () {
  // Feature-detection: prüfe, ob die API verfügbar ist
  if (typeof navigator.requestMIDIAccess !== 'function') {
    onMIDIFailure('MIDI Access is not implemented in this browser!');
    onMIDIFailure(
      'Current browser with MIDI access:  <a href="https://caniuse.com/?search=midiaccess" target="_blank">https://caniuse.com/?search=midiaccess</a>'
    );
    onMIDIFailure(
      'More about this browser: <a href="https://parseapi.com/useragent" target="_blank">https://parseapi.com/useragent</a>'
    );
    return;
  }
  // The Web MIDI API is available to us!
  logger.debug('------------- Web MIDI API Start --------------------');

  navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);

  // onMIDISuccess ######################################################
  function onMIDISuccess(midiAccess) {
    logger.debug('------------- midi Access sucsess!-------------------', midiAccess);
    if (midiAccess.inputs.size === 0) return onMIDIFailure('No MIDI inputs foud!');
    if (midiAccess.outputs.size === 0) return onMIDIFailure('No MIDI outputs foud!');

    // Speichere ALLE verfügbaren Ports (ungefiltert) für Blacklist-UI
    midiBay.allInNameMap = getNameMap(midiAccess.inputs);
    midiBay.allOutNameMap = getNameMap(midiAccess.outputs);

    // Erstelle Port-Maps und filtere geblackliste Ports heraus
    midiBay.outNameMap = getFilteredNameMap(midiAccess.outputs);
    midiBay.inNameMap = getFilteredNameMap(midiAccess.inputs);
    midiBay.portNameMap = new Map([
      ['in', midiBay.inNameMap],
      ['out', midiBay.outNameMap],
    ]);

    console.group('initWebMidiBay');
    initHtml(); // htmlMessage.js
    initRouting(); // routingPorts.js'
    initFilter(); // filter.js
    console.groupEnd('initWebMidiBay');

    midiAccess.onstatechange = (stateEvent) => {
      showMidiAccessStateChange(stateEvent.port); // initHtml.js
    };

    midiBay.inNameMap.forEach((input) => {
      input.onmidimessage = receiveMIDIMessage; // send msg to output!!! -> midiMessage.js
    });
    logger.debug('-=*#@#*=- midiBay: -=*#@#*=-', midiBay);
  }

  // ##################################################

  // onMIDIFailure @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  function onMIDIFailure(error) {
    // const h1 = document.querySelector('h1');
    // h1.innerText = `${h1.innerText} -> no MIDI!`;
    if (localStorage.getItem('error') === 'ignore') {
      localStorage.removeItem('error');
      return;
    }
    if (document.querySelector('h1.error')) {
      const h2 = document.createElement('h2');
      addClass(h2, 'error');
      h2.innerHTML = error;
      const body = document.querySelector('body').appendChild(h2);
      logger.error(error);
      return;
    }
    const body = document.querySelector('body');
    body.innerHTML = `<h1 class="error">WebMidiBay -> has no access to MIDI <span onClick="localStorage.setItem('error', 'ignore')">ports!</span></h1>
    <h2 class="error">${error}</h2>
    <p class="error">
      WebMidiBay is a MIDI router, filter, monitor and SysEx handler running in your web browser. 
    </p>
    <p class="error">
      It uses the <strong><a href="https://www.w3.org/TR/webmidi/" target="_blank">Web MIDI API</a></strong> to access connected MIDI devices.
    </p>
    <div class="browser-support-error">
    <p class="error">
    The following browsers in their current versions support the Web MIDI API (after permission has been granted to the browser!):
    <ul class="error">
    <li>Google Chrome</li>
    <li>Mozilla Firefox</li>
    <li>Opera</li>
    <li>Microsoft Edge</li>
    </ul>
    </p>
    <p class="error">
    Tested on Windows 10/11 and macOS. (Currently no explicit support for Android and iOS.)
    </div>
    </p>
    <p class="error">
      Developed by Michael Vorndran -
      <a href="https://www.webmidibay.de" target="_blank">https://www.webmidibay.de</a>
    </p>
    <p class="error">
      Source code available on
      <a href="https://github.com/vorndran/webmidibay" target="_blank">GitHub</a>
    </p>
    `;
    // <p class="error">Please use a WebMIDI compatible browser like <a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a> or <a href="https://www.microsoft.com/edge" target="_blank">Microsoft Edge</a>!</p>
    // <p class="error">More about WebMIDI support: <a href="https://caniuse.com/?search=midiaccess" target="_blank">https://caniuse.com/?search=midiaccess</a></p>
    // <p class="error">More about this browser: <a href="https://parseapi.com/useragent" target="_blank">https://parseapi.com/useragent</a></p>
    logger.error('------------- error ----------------');
    logger.error(error);
    // Permission was not granted. :(
  }

  // function openMidiPort() {
  //   let promise = new Promise((resolve, reject)=>{})
  // }
})();
