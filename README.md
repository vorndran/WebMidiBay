# WebMidiBay

**A browser-based MIDI routing and monitoring tool using the Web MIDI API**

## Features

- 🎹 **MIDI Routing**: Connect any MIDI input to multiple outputs with visual feedback
- 📊 **Message Monitor**: Real-time display of MIDI messages with filtering options
- �� **Signal Visualization**: Visual indicators for MIDI activity, Clock, and Active Sensing
- 🎛️ **Channel Filtering**: Filter messages by MIDI channel
- 📝 **SysEx Support**: View and export System Exclusive messages
- 💾 **Storage**: Save and restore routing configurations
- 🎨 **Port Aliases**: Customize port names for better organization
- ⚡ **Performance**: Optimized for low latency and high throughput

## Browser Support

WebMidiBay requires a browser with Web MIDI API support:
- Chrome/Chromium (recommended)
- Edge
- Opera

**Note:** Firefox and Safari do not currently support the Web MIDI API.

## Usage

1. Open `index.html` in a supported browser
2. Connect your MIDI devices
3. Grant MIDI access permission when prompted
4. Start routing and monitoring!

## Key Concepts

### Routing
Click on an input port to select it, then click on output ports to create routing connections. Messages from the input will be sent to all connected outputs.

### Filtering
- **Channel Filter**: Show only messages from specific MIDI channels
- **Message Filter**: Toggle visibility of different message types
- **Clock Display**: Show/hide MIDI Clock and Active Sensing messages

### Signals
- **Blink Signals**: Brief flashes on MIDI activity
- **Clock Active**: Persistent indicator for continuous Clock signals
- **Multiple Clock Sources**: Warning when an output receives Clock from multiple inputs

## License

MIT License

## Author

Michael Vorndran
