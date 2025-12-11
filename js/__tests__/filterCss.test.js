'use strict';

import { setPortTagFilterClass, setFilterPortInfoTagClass } from '../filter/filterCss.js';
import { midiPort } from '../main.js';
import { PortMetadataManager } from '../portMetadata.js';

// Mock-Setup
beforeEach(() => {
  // DOM-Setup
  document.body.innerHTML = `
    <div id="filter">
      <div class="filterportinfo"></div>
    </div>
  `;
  
  // MIDI-Port Mocks
  const mockPort = {
    name: 'Test Port',
    type: 'input',
    tag: document.createElement('div')
  };
  
  // Metadaten-Setup
  midiPort.metadataManager = new PortMetadataManager();
  const metadata = midiPort.metadataManager.getMetadata(mockPort);
  metadata.filterSet = new Set();
  metadata.channel = { filter: 0, reset: 0 };
  // UI-Tag in Metadata setzen, Tests greifen auf port.tag zu, daher beide verweisen aufs gleiche Element
  metadata.tag = mockPort.tag;
  metadata.tagId = 'test-port';
  
  // Global midiPort Setup
  midiPort.selectedPort = mockPort;
});

describe('Filter CSS Tests', () => {
  test('setPortTagFilterClass adds filtered class when filters active', () => {
    const port = midiPort.selectedPort;
    const metadata = midiPort.metadataManager.getMetadata(port);
    
    // Aktiviere Filter
    metadata.filterSet.add('test');
    setPortTagFilterClass(port);
    expect(port.tag.classList.contains('filtered')).toBe(true);
    
    // Deaktiviere Filter
    metadata.filterSet.clear();
    setPortTagFilterClass(port);
    expect(port.tag.classList.contains('filtered')).toBe(false);
  });

  test('setFilterPortInfoTagClass shows correct port alias', () => {
    const portInfoTag = document.querySelector('.filterportinfo');
    const port = midiPort.selectedPort;
    const metadata = midiPort.metadataManager.getMetadata(port);
    
    metadata.alias = 'Test Alias';
    setFilterPortInfoTagClass();
    
    expect(portInfoTag.innerHTML).toBe('Test Alias');
    expect(portInfoTag.classList.contains('chosen')).toBe(true);
    
    // Test mit deselektiertem Port
    midiPort.selectedPort = null;
    setFilterPortInfoTagClass();
    
    expect(portInfoTag.innerHTML).toBe('all inputs');
    expect(portInfoTag.classList.contains('chosen')).toBe(false);
  });
});