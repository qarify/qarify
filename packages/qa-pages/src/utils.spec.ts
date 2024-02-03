import { expect } from 'expect-webdriverio';
import {
  shortenNodePath, lengthenNodePath,
} from "./utils.js";

describe('utils', function() {
  it('shorten/lengthen node path', () => {
    expect(shortenNodePath('')).toBe('');
    expect(shortenNodePath('0')).toBe('0');
    expect(shortenNodePath('0.0')).toBe('0_2');
    expect(shortenNodePath('0.0.0')).toBe('0_3');
    expect(shortenNodePath('0.0.1.2.2.3.4.4.4.4')).toBe('0_2.1.2_2.3.4_4');

    expect(lengthenNodePath('')).toBe('');
    expect(lengthenNodePath('0')).toBe('0');
    expect(lengthenNodePath('0_2')).toBe('0.0');
    expect(lengthenNodePath('0_3')).toBe('0.0.0');
    expect(lengthenNodePath('0_2.1.2_2.3.4_4')).toBe('0.0.1.2.2.3.4.4.4.4');
  });
});
