export { setText, setTagInnerHTML, clearInnerHTML, setAttributes };

import { getElement } from './domUtils.js';

/**
 * Setzt den Textinhalt eines Elements.
 * @param {Element|string} elementOrSelector
 * @param {string} text
 */
function setText(elementOrSelector, text) {
  const el = getElement(elementOrSelector);
  if (!el) return;
  el.textContent = text ?? '';
}

/**
 * Setzt den HTML-Inhalt eines Elements.
 * @param {Element|string} elementOrSelector
 * @param {string} html
 */
function setTagInnerHTML(elementOrSelector, html) {
  const el = getElement(elementOrSelector);
  if (!el) return;
  el.innerHTML = html ?? '';
}

/** Löscht den gesamten Inhalt eines Elements. */
function clearInnerHTML(elementOrSelector) {
  const el = getElement(elementOrSelector);
  if (!el) return;
  setTagInnerHTML(el, '');
}

/** Setzt ein einzelnes Attribut. */
function setAttributes(element, attributes) {
  if (!element || !attributes) return;
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}
