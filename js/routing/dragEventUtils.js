export { getEventCoordinates, getEvent_xy };

/**
 * Extrahiert X/Y-Koordinaten aus dem Event
 */
function getEventCoordinates(event) {
  const eventXyMap = getEvent_xy(event);
  return {
    x: eventXyMap.get('x'),
    y: eventXyMap.get('y'),
  };
}

/**
 * Normalisiert Event-Koordinaten für verschiedene Event-Typen
 */
function getEvent_xy(event) {
  let event_x;
  let event_y;
  switch (event.type) {
    case 'pointermove':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'pointerup':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'mousemove':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'mouseup':
      event_x = event.pageX - window.scrollX;
      event_y = event.pageY - window.scrollY;
      break;
    case 'touchmove':
      event_x = event.touches[0]?.pageX - window.scrollX;
      event_y = event.touches[0]?.pageY - window.scrollY;
      break;
    case 'touchend':
      event_x = event.changedTouches[0]?.pageX - window.scrollX;
      event_y = event.changedTouches[0]?.pageY - window.scrollY;
      break;
  }
  return new Map([
    ['x', event_x],
    ['y', event_y],
  ]);
}
