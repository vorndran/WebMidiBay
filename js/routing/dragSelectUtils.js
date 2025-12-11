export { preventSelect };

/**
 * Verhindert Textauswahl während Drag-Operationen
 * https://stackoverflow.com/questions/16805684/javascript-disable-text-select
 */
function preventSelect() {
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);
  window.addEventListener('touchcancel', onDragEnd);
  window.addEventListener('selectstart', disableSelect);
}

/**
 * Entfernt Event-Listener nach Drag-Ende
 */
function onDragEnd() {
  window.removeEventListener('mouseup', onDragEnd);
  window.removeEventListener('touchend', onDragEnd);
  window.removeEventListener('touchcancel', onDragEnd);
  window.removeEventListener('selectstart', disableSelect);
}

/**
 * Verhindert Standard-Textauswahl
 */
function disableSelect(event) {
  event.preventDefault();
}