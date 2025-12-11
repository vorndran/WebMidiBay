import { getChannel } from '../midiMessage.js';

describe('MIDI Message Functions', () => {
  describe('getChannel', () => {
    test('should return channel number (0-15) for MIDI status bytes < 240', () => {
      expect(getChannel(144)).toBe(0);  // Note On, channel 1
      expect(getChannel(145)).toBe(1);  // Note On, channel 2
      expect(getChannel(159)).toBe(15); // Note On, channel 16
    });

    test('should return null for system messages (status bytes >= 240)', () => {
      expect(getChannel(240)).toBe(null); // System Exclusive
      expect(getChannel(248)).toBe(null); // Timing Clock
      expect(getChannel(255)).toBe(null); // System Reset
    });
  });
});