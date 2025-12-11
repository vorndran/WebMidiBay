'use strict';

import { resetAllFilter, chooseFilterSet, storeFilter, restoreFilter } from '../filter/filter.js';
import { midiPort } from '../main.js';
import { PortMetadataManager } from '../portProperties.js';
import * as storage from '../storage/storage.js';

describe('Filter Tests', () => {
  let mockPort;
  let mockEvent;

  beforeEach(() => {
    // start with a clean sessionStorage for tests that use real storage
    sessionStorage.clear();
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="filter">
        <div class="filter" data-statusbyte="test-filter"></div>
      </div>
    `;
    midiPort.divFilterTag = document.getElementById('filter');
    midiPort.divFilterTag.classFilterTags = midiPort.divFilterTag.querySelectorAll('.filter');

    // Setup mocks
    mockPort = {
      name: 'Test Port',
      type: 'input',
      tag: document.createElement('div'),
    };

    mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    // Setup midiPort
    midiPort.metadataManager = new PortMetadataManager();
    midiPort.tagIdMap = new Map([['test', mockPort]]);
    midiPort.inNameMap = new Map([['Test Port', mockPort]]);
    midiPort.outNameMap = new Map(); // Initialize empty outNameMap for filter storage
    midiPort.globalFilterSet = new Set();
    // Ensure globalChannel exists for channel operations
    midiPort.globalChannel = { filter: 0, reset: 0 };
    // Provide channel tag maps expected by filterChannel functions
    midiPort.channelTagMap = {
      filter: new Map([[0, document.createElement('div')]]),
      reset: new Map([[0, document.createElement('div')]]),
    };

    // Initialize metadata
    const metadata = midiPort.metadataManager.getMetadata(mockPort);
    metadata.filterSet = new Set(['test-filter']);
    // provide UI tag reference on metadata for filterCss operations
    metadata.tag = mockPort.tag;
  });

  test('resetAllFilter clears all filterSets', () => {
    resetAllFilter(mockEvent);

    const metadata = midiPort.metadataManager.getMetadata(mockPort);
    expect(metadata.filterSet.size).toBe(0);
    expect(midiPort.globalFilterSet.size).toBe(0);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('chooseFilterSet returns correct filterSet', () => {
    // Test with no selected port
    midiPort.selectedPort = null;
    let result = chooseFilterSet();
    expect(result).toBe(midiPort.globalFilterSet);

    // Test with selected port
    midiPort.selectedPort = mockPort;
    result = chooseFilterSet();
    expect(result).toBe(midiPort.metadataManager.getMetadata(mockPort).filterSet);
  });

  test('storeFilter serializes filterSets correctly', () => {
    const metadata = midiPort.metadataManager.getMetadata(mockPort);
    metadata.filterSet = new Set(['filter1', 'filter2']);
    midiPort.globalFilterSet = new Set(['global1']);

    storeFilter();

    // Verify input port filters are stored correctly
    const storedInputFilters = storage.getStorage('WMB_midi_filter_in');
    expect(storedInputFilters).toBeDefined();
    expect(storedInputFilters).toHaveProperty('Test Port');
    expect(storedInputFilters['Test Port']).toEqual(expect.arrayContaining(['filter1', 'filter2']));
    expect(storedInputFilters['Test Port'].length).toBe(2);

    // Verify output port filters (should be empty in this test)
    const storedOutputFilters = storage.getStorage('WMB_midi_filter_out');
    expect(storedOutputFilters).toBeDefined();
    expect(storedOutputFilters).toEqual({});

    // Verify global filters are stored correctly
    const storedGlobalFilters = storage.getStorage('WMB_midi_filter_all');
    expect(storedGlobalFilters).toBeDefined();
    expect(storedGlobalFilters).toEqual(['global1']);
  });

  test('restoreFilter deserializes filterSets correctly', () => {
    // seed sessionStorage with serialized values
    storage.setStorage('WMB_midi_filter_in', { 'Test Port': ['restored1', 'restored2'] });
    storage.setStorage('WMB_midi_filter_all', ['global-restored']);

    restoreFilter();

    const metadata = midiPort.metadataManager.getMetadata(mockPort);
    expect([...metadata.filterSet]).toEqual(['restored1', 'restored2']);
    expect([...midiPort.globalFilterSet]).toEqual(['global-restored']);
  });
});
