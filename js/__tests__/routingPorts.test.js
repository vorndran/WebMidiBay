'use strict';

import { setRouting, resetRoutingSets } from '../routing/routingPorts.js';
import { setInportRoutingClass, setOutportRoutingClass } from '../routing/routingCssClasses.js';
import { midiPort } from '../main.js';
import { PortMetadataManager } from '../portProperties.js';

describe('Routing Tests', () => {
  let mockInPort;
  let mockOutPort;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="routing">
        <ul id="input_list">
          <div id="in-1" class="port input"></div>
        </ul>
        <ul id="output_list">
          <div id="out-1" class="port output"></div>
        </ul>
      </div>
      <p class="size"></p>
      <svg id="graph">
        <g id="graph_top_left"></g>
        <g id="graph_right"></g>
        <g id="graph_bottom"></g>
      </svg>
    `;

    // Mock getBoundingClientRect for all elements
    const mockRect = {
      top: 0,
      right: 120,
      bottom: 40,
      left: 0,
      width: 120,
      height: 40,
      x: 0,
      y: 0,
    };

    // Mock window.scrollX/Y
    global.window.scrollX = 0;
    global.window.scrollY = 0;

    // Get graph elements and create mocks
    const mockGetBoundingClientRect = () => ({
      top: 0,
      right: 120,
      bottom: 40,
      left: 0,
      x: 0,
      y: 0,
      width: 120,
      height: 40,
    });

    // Create and configure graph elements
    const topLeftTag = document.getElementById('graph_top_left');
    const rightTag = document.getElementById('graph_right');
    const bottomTag = document.getElementById('graph_bottom');

    // Apply mock to graph elements
    [topLeftTag, rightTag, bottomTag].forEach((elem) => {
      elem.getBoundingClientRect = mockGetBoundingClientRect;
    });

    // Initialize graphTag as the real DOM element and attach helpers
    const graphElem = document.getElementById('graph');
    graphElem.topLeftTag = topLeftTag;
    graphElem.rightTag = rightTag;
    graphElem.bottomTag = bottomTag;
    graphElem.lines = [];
    midiPort.graphTag = graphElem;
    midiPort.lineMap = new Map();

    // Setup mock ports
    mockInPort = {
      name: 'Test Input',
      type: 'input',
      tagId: 'in-1',
      tag: document.getElementById('in-1'),
    };

    mockOutPort = {
      name: 'Test Output',
      type: 'output',
      tagId: 'out-1',
      tag: document.getElementById('out-1'),
    };

    // Setup midiPort
    midiPort.metadataManager = new PortMetadataManager();
    // assign UI tags into metadata so code and tests operate on the same DOM nodes
    const inMeta = midiPort.metadataManager.getMetadata(mockInPort);
    inMeta.tag = mockInPort.tag;
    inMeta.tagId = mockInPort.tagId;
    const outMeta = midiPort.metadataManager.getMetadata(mockOutPort);
    outMeta.tag = mockOutPort.tag;
    outMeta.tagId = mockOutPort.tagId;
    midiPort.inNameMap = new Map([['Test Input', mockInPort]]);
    midiPort.outNameMap = new Map([['Test Output', mockOutPort]]);
    midiPort.tagIdMap = new Map([
      ['in-1', mockInPort],
      ['out-1', mockOutPort],
    ]);
  });

  test('setRouting toggles routing connection', () => {
    const metadata = midiPort.metadataManager.getMetadata(mockInPort);

    // Test adding connection
    setRouting(mockInPort, mockOutPort);
    expect(metadata.outPortSet.has(mockOutPort)).toBe(true);
    expect(metadata.outPortNameSet.has(mockOutPort.name)).toBe(true);

    // Test removing connection
    setRouting(mockInPort, mockOutPort);
    expect(metadata.outPortSet.has(mockOutPort)).toBe(false);
    expect(metadata.outPortNameSet.has(mockOutPort.name)).toBe(false);
  });

  test('resetRoutingSets clears all routing connections', () => {
    const metadata = midiPort.metadataManager.getMetadata(mockInPort);

    // Add routing
    setRouting(mockInPort, mockOutPort);
    expect(metadata.outPortSet.size).toBe(1);

    // Reset routing
    resetRoutingSets();
    expect(metadata.outPortSet.size).toBe(0);
    expect(metadata.outPortNameSet.size).toBe(0);
  });

  test('setInportRoutingClass sets CSS classes correctly', () => {
    const metadata = midiPort.metadataManager.getMetadata(mockInPort);

    // No routing
    setInportRoutingClass();
    expect(mockInPort.tag.classList.contains('routed_to_output')).toBe(false);

    // Add routing
    metadata.outPortSet.add(mockOutPort);
    setInportRoutingClass();
    expect(mockInPort.tag.classList.contains('routed_to_output')).toBe(true);
  });

  test('setOutportRoutingClass handles selected port routing', () => {
    midiPort.selectedPort = mockInPort;
    const metadata = midiPort.metadataManager.getMetadata(mockInPort);

    // Add routing
    metadata.outPortSet.add(mockOutPort);
    setOutportRoutingClass();

    expect(mockOutPort.tag.classList.contains('routed_to_selected_input')).toBe(true);

    // Deselect port
    midiPort.selectedPort = null;
    setOutportRoutingClass();
    expect(mockOutPort.tag.classList.contains('routed_to_selected_input')).toBe(false);
  });
});
