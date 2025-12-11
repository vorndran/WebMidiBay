export {
  dispatchClickIfActive,
  toggleActive,
  addClassToAll,
  removeClassFromAll,
  toggleClass,
  hasClass,
};

import { toggleDisplayClass, getElement } from './domStyles.js';

/**
 * Löst einen Klick auf ein Element aus, wenn dessen Elternteil die Klasse 'active' hat.
 * Nützlich zum Deaktivieren anderer Menüsektionen.
 */
function dispatchClickIfActive(selector) {
  const tag = document.querySelector(selector);
  if (tag?.parentElement.classList.contains('active')) {
    tag.dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
  }
}

/**
 * Toggle 'active' Klasse, optional mit erzwungenem Zustand.
 */
function toggleActive(selector, force) {
  const el = document.querySelector(selector);
  if (!el) return;
  return toggleDisplayClass(el, 'active', force);
}

/**
 * Fügt eine Klasse zu allen Elementen hinzu, die dem Selektor entsprechen.
 */
function addClassToAll(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.classList.add(className));
}

/**
 * Entfernt eine Klasse von allen Elementen, die dem Selektor entsprechen.
 */
function removeClassFromAll(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.classList.remove(className));
}

/**
 * Toggle eine Klasse für ein Element (querySelector).
 */
function toggleClass(elementOrSelector, className, force) {
  const el = getElement(elementOrSelector);
  if (!el) return false;
  return toggleDisplayClass(el, className, force);
}

/**
 * Prüft, ob ein Element eine Klasse hat.
 */
function hasClass(elementOrSelector, className) {
  // const el = document.querySelector(selector);
  const el = getElement(elementOrSelector);
  return el ? el.classList.contains(className) : false;
}
