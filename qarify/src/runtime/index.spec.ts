import { expect } from 'expect-webdriverio';
import {
  runtimePrepareSpecs,
  runtimeExecQArify,
  runtimeLoadConfig,
  runtimeLoadConfigByPath,
} from '../index.js';

describe('runtime', () => {
  it('should import properly', async () => {
    expect(runtimePrepareSpecs).toBeDefined();
    expect(typeof (await runtimePrepareSpecs)).toBe('function');
    expect(runtimeExecQArify).toBeDefined();
    expect(typeof (await runtimeExecQArify)).toBe('function');
    expect(runtimeLoadConfig).toBeDefined();
    expect(typeof (await runtimeLoadConfig)).toBe('function');
    expect(runtimeLoadConfigByPath).toBeDefined();
    expect(typeof (await runtimeLoadConfigByPath)).toBe('function');
  });
});
