import { describe, expect, it } from 'vitest';
import type { QADriver } from '@qarify/types';

import { getDriver, setDriver, removeDriver } from '@qarify/browser';

describe('driver', () => {
  it('should get/set/remove driver instance', () => {
    expect(getDriver('')).toBeUndefined();
    setDriver('a', {} as QADriver);
    expect(getDriver('a')).toEqual({});
    removeDriver('a');
    expect(getDriver('a')).toBeUndefined();
  });
});
