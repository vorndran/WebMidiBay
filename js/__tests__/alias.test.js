'use strict';

import { midiPort } from '../main.js';
import { PortMetadataManager } from '../portProperties.js';
import * as storage from '../storage/storage.js';
import * as storagePort from '../storage/storagePort.js';

describe('Alias Storage Tests', () => {
  let mockInPort;
  let mockOutPort;

  // Helper function to reduce repetition
  const setupPort = (name, type) => ({
    name,
    type,
    tag: document.createElement('div'),
  });

  beforeEach(() => {
    // Start with a clean sessionStorage
    sessionStorage.clear();

    mockInPort = setupPort('Test Input Port', 'input');
    mockOutPort = setupPort('Test Output Port', 'output');

    // Setup midiPort
    midiPort.metadataManager = new PortMetadataManager();
    midiPort.inNameMap = new Map([[mockInPort.name, mockInPort]]);
    midiPort.outNameMap = new Map([[mockOutPort.name, mockOutPort]]);
  });

  test('storePortMap saves alias correctly to metadata', () => {
    // Set aliases in metadata
    const inMetadata = midiPort.metadataManager.getMetadata(mockInPort);
    const outMetadata = midiPort.metadataManager.getMetadata(mockOutPort);

    inMetadata.alias = 'My Input Device';
    outMetadata.alias = 'My Output Device';

    // Store aliases
    storagePort.storePortMap('WMB_midi_in_port_alias', midiPort.inNameMap, 'alias');
    storagePort.storePortMap('WMB_midi_out_port_alias', midiPort.outNameMap, 'alias');

    // Verify storage
    const storedInAliases = storage.getStorage('WMB_midi_in_port_alias');
    const storedOutAliases = storage.getStorage('WMB_midi_out_port_alias');

    expect(storedInAliases).toBeDefined();
    expect(storedInAliases).toEqual({
      'Test Input Port': 'My Input Device',
    });

    expect(storedOutAliases).toBeDefined();
    expect(storedOutAliases).toEqual({
      'Test Output Port': 'My Output Device',
    });
  });

  test('restorePortMap restores alias correctly from storage', () => {
    // Seed storage with alias data
    storage.setStorage('WMB_midi_in_port_alias', {
      'Test Input Port': 'Restored Input',
    });
    storage.setStorage('WMB_midi_out_port_alias', {
      'Test Output Port': 'Restored Output',
    });

    // Restore aliases
    storagePort.restorePortMap('WMB_midi_in_port_alias', midiPort.inNameMap, 'alias');
    storagePort.restorePortMap('WMB_midi_out_port_alias', midiPort.outNameMap, 'alias');

    // Verify metadata
    const inMetadata = midiPort.metadataManager.getMetadata(mockInPort);
    const outMetadata = midiPort.metadataManager.getMetadata(mockOutPort);

    expect(inMetadata.alias).toBe('Restored Input');
    expect(outMetadata.alias).toBe('Restored Output');
  });

  test('storePortMap handles ports without aliases', () => {
    // Don't set any aliases, use default values

    storagePort.storePortMap('WMB_midi_in_port_alias', midiPort.inNameMap, 'alias');

    const storedInAliases = storage.getStorage('WMB_midi_in_port_alias');

    expect(storedInAliases).toBeDefined();
    // Default alias should be the port name
    expect(storedInAliases).toEqual({
      'Test Input Port': 'Test Input Port',
    });
  });

  test('restorePortMap handles missing storage gracefully', () => {
    const result = storagePort.restorePortMap('WMB_nonexistent_key', midiPort.inNameMap, 'alias');

    expect(result).toBe(false);

    // Metadata should still have default alias
    const inMetadata = midiPort.metadataManager.getMetadata(mockInPort);
    expect(inMetadata.alias).toBe('Test Input Port');
  });
});
