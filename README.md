# WebMidiBay

**A browser-based MIDI routing and monitoring tool using the [Web MIDI API](https://www.w3.org/TR/webmidi/)**

## Features

- 🎹 **MIDI Routing**: Connect any MIDI input to multiple outputs with visual feedback

- 📊 **Message Monitor**: Real-time display of MIDI messages with filtering options
- 💡 **Signal Visualization**: Visual indicators for MIDI activity, Clock, and Active Sensing
- ⚠️ **Multiple Clock Warning**: Detects when an output receives Clock signals from multiple sources
- 🔍 **MIDI Loop Detection**: Identifies and filters immediate MIDI feedback loops
- 🎛️ **Message Filtering**: Filter messages by MIDI channel and / or event type
- 📝 **SysEx Support**: Auto-collect, view, export and send System Exclusive messages
- 💾 **Storage**: Save and restore routing configurations, filters, and website settings
- 🎨 **Port Aliases**: Customize port names for better organization
- 🚫 **Port Blacklist**: Hide unwanted MIDI ports from the interface
- ⚡ **Performance**: Optimizable for low latency and high throughput
- ⌨️ **Keyboard Shortcuts**: Quick access to main sections (keys 1-4)

## Browser Support

WebMidiBay requires a browser with [Web MIDI API](https://www.w3.org/TR/webmidi/) support:

- Chrome/Chromium
- Edge
- Opera
- Firefox (Desktop only, version 108+)

**Note:** Mobile devices (Android/iOS) are not supported at the current stage of development.

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
- **Multiple Clock Sources Warning**: Red background on output ports receiving Clock from multiple inputs (potential timing conflicts)

### Filter

You can:

- Filter specific MIDI data for all ports
- Filter specific MIDI data for individual in- or output ports only
- Filter all MIDI channels except a selected one
- Set all MIDI channels to a specific channel

### Monitor

- **Port Filter**: Display messages from specific sources (inputs only, outputs only, selected channel, or all)
- **Message Filter**: Toggle visibility of message types (filtered/unfiltered messages, text format, raw data, or both)
- **Clock Display Toggle**: Show/hide MIDI Clock and Active Sensing messages (click clock icon in routing menu)
- **Loop Detection**: Automatically detects and marks MIDI messages that are immediately sent back (feedback loops)
- **Pause/Clear**: Pause message stream or clear monitor display

### SysEx

- **Auto-Collect**: Toggle automatic SysEx collection (independent of monitor visibility)
- **Capture**: Incoming SysEx data is captured and displayed in real-time
- **Save/Export**: Download captured/received SysEx data as `.syx` files
- **Import**: Upload SysEx files and send them via the selected output
- **Auto-Download**: Automatically download received SysEx messages (requires Auto-Collect)

### Settings

- **Port Blacklist**: Hide specific MIDI ports from the interface (useful for virtual ports or unused devices)
- **Export/Import Settings**: Save and load complete configurations as JSON files
- **View Modes**: Toggle between different display layouts
- **Message Line Count**: Adjust how many lines are displayed in the monitor (30-200)

### Performance Optimization

**Reduce latency and improve performance** by hiding the Monitor and disabling Routing signals!

## License

MIT License

## Author

Michael Vorndran
