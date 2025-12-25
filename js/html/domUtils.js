export {
  setStyles,
  getComputedStyleValue,
  show,
  hide,
  preventAndStop,
  toggleClass,
  addClass,
  removeClass,
  hasClass,
  getElement,
  removeClassFromAll,
  removeClasses,
};
/**
 * Setzt mehrere CSS-Style-Eigenschaften (inline) sicher.
 * Wird nur noch für SVG-Styling verwendet, nicht für Sichtbarkeitskontrolle.
 * @param {Element|string} elementOrSelector - Element oder Selektor
 * @param {Object} styles - Map aus { property: value }
 */
function setStyles(elementOrSelector, styles) {
  const el = getElement(elementOrSelector);
  if (!el || !el.style || !styles) return;

  Object.entries(styles).forEach(([prop, val]) => {
    el.style.setProperty(prop, val);
  });
}

/**
 * Holt einen berechneten CSS-Wert für ein Element.
 * @param {Element|string} elementOrSelector - Element oder Selektor
 * @param {string} property - CSS-Eigenschaft (z.B. 'display', 'width')
 * @returns {string} - Wert der CSS-Eigenschaft oder leerer String
 */
function getComputedStyleValue(elementOrSelector, property) {
  const element = getElement(elementOrSelector);
  if (!element) return '';

  const style = window.getComputedStyle(element);
  return property ? style.getPropertyValue(property) || style[property] : '';
}

/** Zeigt ein Element an (entfernt js-hidden Klasse). */
function show(elementOrSelector) {
  return toggleClass(elementOrSelector, 'js-hidden', false);
}

/** Versteckt ein Element (fügt js-hidden Klasse hinzu). */
function hide(elementOrSelector) {
  return toggleClass(elementOrSelector, 'js-hidden', true);
}

/**
 * Kombiniert preventDefault() und stopPropagation() für ein Event.
 * @param {Event} event - Das Event-Objekt
 * @param {boolean} [preventOnly=false] - Wenn true, nur preventDefault
 * @param {boolean} [stopOnly=false] - Wenn true, nur stopPropagation
 */
function preventAndStop(event, preventOnly = false, stopOnly = false) {
  if (!event) return;
  if (!stopOnly) event.preventDefault();
  if (!preventOnly) event.stopPropagation();
}

// #########################################################
/**
 * Hilfsfunktion: Holt Element aus Selector oder Element-Referenz
 */
function getElement(elementOrSelector) {
  const el =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  return el ? el : false;
}

// #########################################################
/**
 * Toggelt eine Klasse an einem Element (Selector oder Element).
 * Basis-Implementierung für alle Klassen-Operationen.
 */
function toggleClass(elementOrSelector, className, force) {
  const el = getElement(elementOrSelector);
  if (!el) return false;

  const hasClassName = el.classList.contains(className);
  const shouldAdd = typeof force === 'boolean' ? force : !hasClassName;

  if (shouldAdd) {
    el.classList.add(className);
  } else {
    el.classList.remove(className);
  }

  return shouldAdd;
}

// #########################################################
// Convenience: explizite Add/Remove-Wrappers (für Lesbarkeit an den Call-Sites)
function addClass(elementOrSelector, className) {
  return toggleClass(elementOrSelector, className, true);
}

// #########################################################
/**
 * Entfernt eine Klasse von allen Elementen, die dem Selektor entsprechen.
 */
function removeClassFromAll(selector, className) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => el.classList.remove(className));
}

// #########################################################
/**
 * Entfernt mehrere CSS-Klassen von einem Element
 * @param {HTMLElement} element - Das HTML-Element
 * @param {string[]} classes - Array von Klassennamen
 */
function removeClasses(element, classes) {
  if (!element) return;
  classes.forEach((cls) => element.classList.remove(cls));
}

// #########################################################
function removeClass(elementOrSelector, className) {
  return toggleClass(elementOrSelector, className, false);
}

// #########################################################
/**
 * Prüft, ob ein Element eine Klasse hat.
 */
function hasClass(elementOrSelector, className) {
  const el = getElement(elementOrSelector);
  return el ? el.classList.contains(className) : false;
}
