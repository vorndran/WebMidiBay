'use strict';

export {
  // midiAccessData,
  // getFiles,
  midiBay,
  soundMap,
  // fileUrl,
  // timingClockStillActive,
};
import { receiveMIDIMessage } from './midiMessage.js';
import { initFilter } from './filter/filter.js';
import { initRouting } from './routing/routingPorts.js';
import { initHtml, showMidiAccessStateChange } from './html/html.js';
import { PortPropertiesManager } from './portProperties.js';
import { logger } from './utils/logger.js';
import { getNameMap, getFilteredNameMap } from './html/htmlBlacklist.js';

const midiBay = {
  portPropertiesManager: new PortPropertiesManager(),
  sysexFileMap: new Map(),
  sysexMessage: [],
  dumpRequestObj: {},
  signalsEnabled: true, // Global Flag für Visual Signals
  portBlacklist: new Set(),
};

const soundMap = new Map();

// const readTimingClock = false;

// let timingClockStillActive = false;
// ################################
// ########## Start ###############
// ################################
(function () {
  // Feature-detection: prüfe, ob die API verfügbar ist
  if (typeof navigator.requestMIDIAccess !== 'function') {
    onMIDIFailure('MIDI Access is not implemented in this browser!');
    onMIDIFailure('Current browser with MIDI access: "https://caniuse.com/?search=midiaccess"');
    onMIDIFailure('More about this browser: "https://parseapi.com/useragent"');
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
      showMidiAccessStateChange(stateEvent.port); // html.js
    };

    midiBay.inNameMap.forEach((input) => {
      input.onmidimessage = receiveMIDIMessage; // send msg to output!!! -> midiMessage.js
      input.on;
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
      h2.classList.add('error');
      h2.innerHTML = error;
      const body = document.querySelector('body').appendChild(h2);
      logger.error(error);
      return;
    }
    const body = document.querySelector('body');
    body.innerHTML = `<h1 class="error">WebMidiBay -> but not in this <span onClick="localStorage.setItem('error', 'ignore')">browser!</span></h1>
    <h2 class="error">${error}</h2>`;
    logger.error('------------- error ----------------');
    logger.error(error);
    // Permission was not granted. :(
  }

  // function openMidiPort() {
  //   let promise = new Promise((resolve, reject)=>{})
  // }
})();
