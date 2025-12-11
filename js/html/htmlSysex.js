export { showSysex };
import { soundCategories } from '../sysex/BlofelSyntax.js';
// import { setFilterClass } from '../filter/filterCss.js';
import { midiBay, soundMap } from '../main.js';
import { sendSound } from '../sysex/sysex.js';
import { setTagInnerHTML } from './domContent.js';
import { logger } from '../utils/logger.js';

// ########################################################
function embedTag(mimeType, downloadString) {
  const embedTag = document.createElement('embed');
  embedTag.setAttribute('src', `${mimeType}, ${downloadString}`);
  embedTag.setAttribute('autostart', 'false');
  // embedTag.style.display = 'none';
  document.body.appendChild(embedTag);
}

// ########################################################
function showSysex() {
  logger.debug('showSysex');

  let pSnd = document.querySelector('#sysex');
  let soundHead = '';

  const soundList = {};
  soundCategories.map((cat, i) => {
    soundHead += `<details class='categories'><summary id='${soundCategories[i]}'>${soundCategories[i]}</summary></details>`;
    soundList[cat] = new Array();
  });
  soundMap.forEach((sound) => {
    if (soundList[sound.cat]) {
      soundList[sound.cat].push(sound.soundname);
    } else {
      logger.debug('sound', sound);
    }
  });
  setTagInnerHTML(pSnd, soundHead);

  soundCategories.map((cat, i) => {
    document.getElementById(soundCategories[i]).parentElement.innerHTML += `<p><span>${soundList[
      cat
    ].join('</span><span>')}</span></p>`;
    document
      .getElementById(soundCategories[i])
      .parentElement.addEventListener('click', showSoundCategories);
  });
}
// showSoundCategories ###########################################################
function showSoundCategories(eClick) {
  logger.debug('show SoundCategories');

  if (eClick.target.nodeName == 'SUMMARY' && eClick.target.parentElement.open == false) {
    Array.from(document.querySelectorAll('.categories')).map((elm) => {
      elm.open = false;
    });
    eClick.target.parentElement.open = false;
    //console.log(eClick.target.parentElement.open);
  } else if (eClick.target.nodeName == 'SPAN') {
    //console.log(eClick.target.parentElement);
    //console.log(eClick.target.parentElement.previousSibling.id);
    //console.log(eClick.target.parentElement.parentElement.parentElement);
    sendSound(eClick.target.innerText, eClick.target.parentElement.previousSibling.id);
  }
  eClick.stopPropagation();
}
