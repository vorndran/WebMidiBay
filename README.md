# WebMidiBay

**A browser-based MIDI routing and monitoring tool using the [Web MIDI API](https://www.w3.org/TR/webmidi/)**

## Features

- 🎹 **MIDI Routing**: Connect any MIDI input to multiple outputs with visual feedback
- 📊 **Message Monitor**: Real-time display of MIDI messages with filtering options
- 💡 **Signal Visualization**: Visual indicators for MIDI activity, Clock, and Active Sensing
- 🎛️ **Channel Filtering**: Filter messages by MIDI channel
- 📝 **SysEx Support**: View and export System Exclusive messages
- 💾 **Storage**: Save and restore routing configurations, filters, and website settings
- 🎨 **Port Aliases**: Customize port names for better organization
- ⚡ **Performance**: Optimizable for low latency and high throughput

## Browser Support

WebMidiBay requires a browser with [Web MIDI API](https://www.w3.org/TR/webmidi/) support:

- Chrome/Chromium
- Edge
- Opera
- Firefox (Desktop only, version 108+)

**Note:** Safari and Firefox on mobile devices (Android/iOS) do not currently support the [Web MIDI API](https://www.w3.org/TR/webmidi/).

## Usage

1. Connect your MIDI devices
2. Open `index.html` in a supported browser (if already open, reload the page)
3. Grant MIDI access permission when prompted
4. Start routing and monitoring!

## Key Concepts

### Visibility

Show or hide page sections (filter, monitor, sysex, and info/settings) by clicking in the main menu or using keyboard keys **1-4**.

### Routing

**Click-based routing:**

1. Select **"routing"** in the routing menu
2. Click on an input port to select it
3. Click on output ports to create routing connections
4. Messages from the input will be sent to all connected outputs

**Drag and drop routing:**  
When the window width allows inputs and outputs to be displayed side by side, you can drag connections directly from input ports to output ports.

**Signals:**  
Click the lightbulb icon in the routing menu to toggle MIDI event visibility:

- **Blink Signals**: Brief flashes indicate MIDI activity
- **Clock Active**: Persistent indicator for continuous MIDI Clock signals

### Filter

You can:

- Filter specific MIDI data for all ports
- Filter specific MIDI data for individual in- or output ports only
- Filter all MIDI channels except a selected one
- Set all MIDI channels to a specific channel

### Monitor

- **Channel Filter**: Display messages from specific sources (inputs only, outputs only, selected channel, or all)
- **Message Filter**: Toggle visibility of message types (filtered/unfiltered messages, text format, raw data, or both)

### SysEx

- **Capture**: Incoming SysEx data is captured and displayed in real-time
- **Export**: Download captured SysEx data as `.syx` files
- **Import**: Upload SysEx files and send them via the selected output

### Performance Optimization

**Reduce latency and improve performance** by hiding the Monitor and disabling Routing signals!

## License

MIT License

## Author

Michael Vorndran
