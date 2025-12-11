export {
  setText,
  setTagInnerHTML,
  clearNode,
  setAttr,
  setAttributes,
  createElementWithAttributes,
  insertPrependLimited,
};

import { getElement } from './domStyles.js';

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
function clearNode(elementOrSelector) {
  const el = getElement(elementOrSelector);
  if (!el) return;
  setTagInnerHTML(el, '');
}

/** Setzt ein einzelnes Attribut. */
function setAttr(elementOrSelector, name, value) {
  const el = getElement(elementOrSelector);
  if (!el) return;
  el.setAttribute(name, value);
}

/**
 * Setzt mehrere Attribute auf ein Element.
 * @param {Element} element - Das Zielelement
 * @param {Object} attributes - Key-Value-Paare für Attribute
 */
function setAttributes(element, attributes) {
  if (!element || !attributes) return;
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

/**
 * Erstellt ein Element mit optionalen Attributen.
 * @param {string} tagName - Tag-Name (z.B. 'div', 'p')
 * @param {Object} [attributes] - Optional: Key-Value-Paare für Attribute
 * @param {string} [namespaceURI] - Optional: Namespace für SVG etc.
 * @returns {Element} - Das erstellte Element
 */
function createElementWithAttributes(tagName, attributes = {}, namespaceURI = null) {
  const element = namespaceURI
    ? document.createElementNS(namespaceURI, tagName)
    : document.createElement(tagName);

  setAttributes(element, attributes);
  return element;
}

/**
 * Prepend eines Kindes und Begrenzung der Kindzahl auf maxChildren.
 */
function insertPrependLimited(parent, node, maxChildren) {
  parent.insertBefore(node, parent.children[0]);
  if (typeof maxChildren === 'number' && parent.childNodes.length > maxChildren) {
    parent.removeChild(parent.lastChild);
  }
}
