js/
├── constants/
│   └── midiConstants.js       ← MIDI-Daten (cc, mmsg, notes)
├── core/
│   ├── midiMessageFilter.js   ← Filter-Logik
│   └── midiMessageSignal.js   ← Signal-Visualisierung
├── utils/
│   ├── helpers.js
│   ├── logger.js
│   └── midiHelpers.js         ← MIDI-Helper-Funktionen
├── routing/
│   ├── routingPorts.js        (158 Zeilen)
│   ├── routingLines.js        (91 Zeilen) ← Logik
│   ├── routingLinesSvg.js     (161 Zeilen) ← SVG-Rendering
│   ├── routingSelectedPort.js (121 Zeilen)
│   ├── routingCssClasses.js   (95 Zeilen)
│   └── routingDragAndDrop.js
├── filter/
├── html/
└── __tests__/
    └── helpers/
        └── compareSysexArray.js