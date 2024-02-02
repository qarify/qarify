import { expect } from 'expect-webdriverio';
import type { InternalDriver } from '@qarify/types';

import { getDriver, setDriver, removeDriver } from '@qarify/browser';

describe('driver', () => {
  it('should get/set/remove driver instance', () => {
    expect(getDriver('')).toBeUndefined();
    setDriver('a', {} as InternalDriver);
    expect(getDriver('a')).toEqual({});
    removeDriver('a');
    expect(getDriver('a')).toBeUndefined();
  });
});
