# WebMidiBay - Beispiele und Best Practices

## Port-Metadaten

### Grundlegende Verwendung

```javascript
// Metadaten eines Ports abrufen/erstellen
const portProperties = midiBay.portPropertiesManager.getPortProperties(port);

// Filter setzen
portProperties.filterSet.add('noteOn');
portProperties.filterSet.add('noteOff');

// Channel-Einstellungen
portProperties.channel.filter = 1; // nur Channel 1
portProperties.channel.reset = 0; // Reset auf alle Channels

// Alias setzen
portProperties.alias = 'Main Synth';
```

### Routing-Verwaltung

```javascript
// Port-Verbindung erstellen
function connectPorts(input, output) {
  const portProperties = midiBay.portPropertiesManager.getPortProperties(input);
  portProperties.outPortSet.add(output);
  portProperties.outPortNameSet.add(output.name); // für Persistenz
  drawAllRoutingLines(); // UI aktualisieren
}

// Verbindung prüfen
function isConnected(input, output) {
  const portProperties = midiBay.portPropertiesManager.getPortProperties(input);
  return portProperties.outPortSet.has(output);
}

// Alle Verbindungen eines Inputs löschen
function disconnectAll(input) {
  const portProperties = midiBay.portPropertiesManager.getPortProperties(input);
  portProperties.outPortSet.clear();
  portProperties.outPortNameSet.clear();
  drawAllRoutingLines();
}
```

### Storage und Wiederherstellung

```javascript
// Routing-Konfiguration speichern
function saveRoutingConfig() {
  const config = {};
  midiBay.inNameMap.forEach((input, name) => {
    const portProperties = midiBay.portPropertiesManager.getPortProperties(input);
    config[name] = [...portProperties.outPortNameSet];
  });
  localStorage.setItem('routing-config', JSON.stringify(config));
}

// Konfiguration laden
function loadRoutingConfig() {
  const config = JSON.parse(localStorage.getItem('routing-config') || '{}');
  midiBay.inNameMap.forEach((input, name) => {
    if (config[name]) {
      const portProperties = midiBay.portPropertiesManager.getPortProperties(input);
      portProperties.outPortNameSet = new Set(config[name]);
    }
  });
  resetOutPortSet(); // Port-Referenzen wiederherstellen
}
```

### Event Handling

```javascript
// MIDI-Events mit Metadaten filtern
function handleMidiMessage(input, event) {
  const portProperties = midiBay.portPropertiesManager.getPortProperties(input);

  // Filter prüfen
  if (portProperties.filterSet.has(event.data[0])) {
    console.log('Message filtered:', event.data);
    return;
  }

  // An verbundene Outputs weiterleiten
  portProperties.outPortSet.forEach((output) => {
    output.send(event.data);
  });
}
```

## Best Practices

1. **Immer Metadaten-API verwenden**

   - Nie direkt Port-Objekte mutieren
   - Metadaten über Manager abrufen
   - Änderungen an Metadaten vornehmen

2. **UI-Updates und MIDI-Logik trennen**

   - MIDI-Verarbeitung in eigenen Funktionen
   - UI-Updates über dedizierte Funktionen
   - Event-Handler sauber strukturieren

3. **Fehlerbehandlung**

   ```javascript
   // Defensive Programmierung
   function getPortPortProperties(port) {
     if (!port || !port.type) {
       console.error('Invalid port:', port);
       return null;
     }
     return midiBay.portPropertiesManager.getPortProperties(port);
   }
   ```

4. **Performance**

   - WeakMap nutzt Garbage Collection effizient
   - Filter-Checks vor teuren Operationen
   - UI-Updates bündeln wenn möglich

5. **Testing**

   ```javascript
   describe('Port PortProperties', () => {
     test('Filter management', () => {
       const port = mockMidiPort();
       const portProperties = midiBay.portPropertiesManager.getPortProperties(port);

       portProperties.filterSet.add('noteOn');
       expect(portProperties.filterSet.has('noteOn')).toBe(true);
     });
   });
   ```
