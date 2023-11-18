import fs from 'fs';
import url from 'url';
import path from 'path';
import { expect } from 'expect-webdriverio';
import XPath from 'xpath';
import { FindStrategy, type QAPageNodeSelector } from '@qarify/types';

import {
  fetchPage,
  setPageCache,
} from './fetch-page.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function _loadPageSrc(platform: 'ios' | 'android', name:string[]) {
  const filePath = path.join(__dirname, '__mock', platform, ...name);
  return fs.readFileSync(filePath).toString();
}

describe('fetch-page', () => {

  it('should validate options', async () => {
    expect(await fetchPage('')).toBe(undefined);
    expect(await fetchPage('', {})).toBe(undefined);
    await expect(() => fetchPage('', { forceFetch: true })).rejects.toThrow(/Invalid options:/);
    await expect(() => fetchPage('', { forceFetch: true, sessionId: 'a' })).rejects.toThrow(/No Driver/);
  });

  it('should set page cache', async () => {
    expect(setPageCache('a', undefined)).toBeTruthy();

    setPageCache('a', {});
    expect(await fetchPage('a')).toEqual({});
    expect(await fetchPage('a', {})).toEqual({});
    setPageCache('a', undefined);
    expect(await fetchPage('a')).toEqual(undefined);

    setPageCache('a', { src: 'b' });
    expect(await fetchPage('a')).toEqual({ src: 'b' });
    expect(await fetchPage('a', {})).toEqual({ src: 'b' });
  });

  it('should parse page source', async () => {
    // ios
    setPageCache('a', { src: _loadPageSrc('ios', ['sample-ios', 'sample-main-view.xml']) });
    let res = await fetchPage('a', { parsingOptions: { } });
    expect(res?.nodes).toBeDefined();
    expect(res?.windowRect).toEqual({ width: 390, height: 844 });

    // android
    setPageCache('a', { src: _loadPageSrc('android', ['sample-android', 'sample-main-view.xml']) });
    res = await fetchPage('a', { parsingOptions: { } });
    expect(res?.nodes).toBeDefined();
    expect(res?.windowRect).toEqual({ width: 1080, height: 1857 });
  });

});
