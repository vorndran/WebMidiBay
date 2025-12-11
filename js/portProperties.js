'use strict';

/**
 * @typedef {Object} Channel
 * @property {number} filter - Der aktuelle Filter-Wert (0-16)
 * @property {number} reset - Reset-Wert für den Channel
 */

/**
 * Verwaltet Metadaten für MIDI-Ports ohne direkte Port-Mutation.
 * Diese Klasse kapselt alle zusätzlichen Daten, die wir mit einem MIDI-Port
 * assoziieren wollen, ohne das Port-Objekt selbst zu verändern.
 */
export class PortPortProperties {
  /**
   * Erstellt neue Metadaten für einen MIDI-Port
   * @param {MIDIPort} port - Der MIDI-Port (Input oder Output)
   *
   * @property {Set<string>} filterSet - Aktive MIDI-Filter für diesen Port
   * @property {Channel} channel - Channel-spezifische Einstellungen
   * @property {string} alias - Benutzerdefinierbarer Name für den Port
   * @property {number} clockBuffer - Puffer für MIDI-Clock-Events
   * @property {number} index - Position in der Port-Liste
   * @property {Array} [lastData] - Letzte MIDI-Daten (nur für Output-Ports)
   * @property {Set<MIDIPort>} [outPortSet] - Verbundene Output-Ports (nur für Input-Ports)
   * @property {Set<string>} [outPortNameSet] - Namen der verbundenen Outputs (für Persistenz)
   */
  constructor(port) {
    this.filterSet = new Set();
    this.type = port.type;
    this.name = port.name;
    this.id = port.id;
    this.alias = port.name;
    this.channel = { filter: 0, reset: 0 };
    this.clockBuffer = 0;
    this.index = 0; // wird durch expandMidiPort gesetzt
    this.lastData = port.type === 'output' ? [] : undefined;
    // UI-related DOM references (moved from direct port properties into portProperties)
    this.tag = undefined;
    this.tagId = undefined;

    // Routing-spezifische Properties
    if (port.type === 'input') {
      this.outPortSet = new Set();
      this.outPortNameSet = new Set();
    }
  }
}

/**
 * Zentrale Metadaten-Verwaltung für MIDI-Ports
 */
export class PortPropertiesManager {
  constructor() {
    this.portProperties = new WeakMap();
  }

  /**
   * Holt oder erstellt Metadaten für einen Port
   * @param {MIDIPort} port - Der MIDI-Port
   * @returns {PortPortProperties} Die Metadaten des Ports
   */
  getPortProperties(port) {
    if (!this.portProperties.has(port)) {
      this.portProperties.set(port, new PortPortProperties(port));
    }
    return this.portProperties.get(port);
  }

  /**
   * Findet einen Port anhand seiner Tag-ID
   * @param {string} tagId - Die Tag-ID des Ports
   * @param {Map} portByTagIdMap - Die Map mit tagId → port Zuordnungen
   * @returns {MIDIPort|null} Der gefundene Port oder null
   */
  getPortByTagId(tagId, portByTagIdMap) {
    return portByTagIdMap.get(tagId) || null;
  }

  // /**
  //  * Aktualisiert den Index eines Ports
  //  * @param {MIDIPort} port - Der MIDI-Port
  //  * @param {number} index - Der neue Index
  //  */
  // setPortIndex(port, index) {
  //   const property = this.getPortProperties(port);
  //   property.index = index;
  // }
}
