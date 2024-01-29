import { expect } from 'expect-webdriverio';
import { getDriver, setDriver, removeDriver } from './driver.js';

describe('driver', () => {
  it('should get/set/remove driver instance', () => {
    expect(getDriver('')).toBeUndefined();
    setDriver('a', {} as WebdriverIO.Browser);
    expect(getDriver('a')).toEqual({});
    removeDriver('a');
    expect(getDriver('a')).toBeUndefined();
  });
});
