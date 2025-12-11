export {
  setStyles,
  getComputedStyleValue,
  show,
  hide,
  addClass,
  getElement,
  removeClass,
  preventAndStop,
  toggleDisplayClass,
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

/**
 * Toggelt eine CSS-Klasse an einem Element.
 * Generische Funktion für beliebige CSS-Klassen (js-hidden, active, selected, etc.).
 * @param {Element|string} elementOrSelector - Element oder Selektor
 * @param {string} [cssClass='js-hidden'] - CSS-Klasse zum Toggeln
 * @param {boolean} [force] - Optional erzwingen: true=hinzufügen, false=entfernen
 * @returns {boolean} true, wenn die Klasse nach dem Toggle vorhanden ist
 */
function toggleDisplayClass(elementOrSelector, cssClass = 'js-hidden', force) {
  const el = getElement(elementOrSelector);
  if (!el) return false;

  const hasClass = el.classList.contains(cssClass);
  const shouldAdd = typeof force === 'boolean' ? force : !hasClass;

  if (shouldAdd) {
    el.classList.add(cssClass);
  } else {
    el.classList.remove(cssClass);
  }

  return shouldAdd;
}

/** Zeigt ein Element mit CSS-nativer Sichtbarkeit an. */
function show(elementOrSelector) {
  return toggleDisplayClass(elementOrSelector, 'js-hidden', false);
}

/** Versteckt ein Element mit js-hidden Klasse. */
function hide(elementOrSelector) {
  return toggleDisplayClass(elementOrSelector, 'js-hidden', true);
}
/** Zeigt ein Element mit CSS-nativer Sichtbarkeit an. */
function addClass(elementOrSelector, cssClass) {
  return toggleDisplayClass(elementOrSelector, cssClass, true);
}

/** Versteckt ein Element mit js-hidden Klasse. */
function removeClass(elementOrSelector, cssClass) {
  return toggleDisplayClass(elementOrSelector, cssClass, false);
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
function getElement(elementOrSelector) {
  const el =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  return el ? el : false;
}
