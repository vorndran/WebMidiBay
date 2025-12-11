import { midiBay } from '../main.js';
import { initFilter } from './filter.js';
import { PortPropertiesManager } from '../portProperties.js';
import * as storage from '../storage/storage.js';

describe('filter', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="filter">
        <div class="filter" data-statusbyte="test-filter"></div>
      </div>
      <div id="monitor"></div>
      <div id="channel">
        <div class="channel_filter" data-channeltype="filter" data-channelvalue="0"></div>
        <div class="channel_reset" data-channeltype="reset" data-channelvalue="0"></div>
      </div>
    `;

    // Initialize required midiBay properties
    midiBay.portPropertiesManager = new PortPropertiesManager();
    midiBay.portByTagIdMap = new Map();
    midiBay.inNameMap = new Map();
    midiBay.outNameMap = new Map();
  });

  test('initializes filter correctly', () => {
    initFilter();
    expect(document.querySelector('.filter')).toBeTruthy();
  });
});
