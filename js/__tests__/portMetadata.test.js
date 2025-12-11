'use strict';

import { PortMetadata, PortMetadataManager } from '../portMetadata.js';

// Mock MIDI Port für Tests
const createMockPort = (name, type = 'input') => ({
  name,
  type,
  state: 'connected',
  connection: 'pending'
});

describe('PortMetadata Tests', () => {
  test('PortMetadata Initialisierung', () => {
    const mockPort = createMockPort('Test Port');
    const metadata = new PortMetadata(mockPort);
    
    expect(metadata.alias).toBe(mockPort.name);
    expect(metadata.filterSet).toBeInstanceOf(Set);
    expect(metadata.filterSet.size).toBe(0);
    expect(metadata.channel).toEqual({ filter: 0, reset: 0 });
    expect(metadata.clockBuffer).toBe(0);
    expect(metadata.index).toBe(0);
    expect(metadata.lastData).toBeUndefined();
  });

  test('Output Port hat lastData Array', () => {
    const mockOutput = createMockPort('Test Output', 'output');
    const metadata = new PortMetadata(mockOutput);
    
    expect(Array.isArray(metadata.lastData)).toBe(true);
    expect(metadata.lastData).toHaveLength(0);
  });
});

describe('PortMetadataManager Tests', () => {
  let manager;
  let mockPort;

  beforeEach(() => {
    manager = new PortMetadataManager();
    mockPort = createMockPort('Test Port');
  });

  test('getMetadata erstellt neue Metadaten wenn nötig', () => {
    const meta = manager.getMetadata(mockPort);
    
    expect(meta).toBeInstanceOf(PortMetadata);
    expect(meta.alias).toBe(mockPort.name);
  });

  test('getMetadata gibt existierende Metadaten zurück', () => {
    const meta1 = manager.getMetadata(mockPort);
    const meta2 = manager.getMetadata(mockPort);
    
    expect(meta1).toBe(meta2);
  });

  test('setPortIndex aktualisiert Index', () => {
    manager.setPortIndex(mockPort, 42);
    const meta = manager.getMetadata(mockPort);
    
    expect(meta.index).toBe(42);
  });
});