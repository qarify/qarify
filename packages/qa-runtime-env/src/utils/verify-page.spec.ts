import fs from 'fs';
import url from 'url';
import path from 'path';
import { expect } from 'expect-webdriverio';
import { parsePageSrc } from '@qarify/pages';

import testQAConfig from '../../../../fixtures/config-files/test-config.js';
import { cleanPageLayout, readPageLayout } from '../nodejs/artifacts-utils.js';
import {
  calcOverlapRatio, getPageLayout, comparePageLayout, getDiffLayoutItems
} from './verify-page.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../../fixtures', import.meta.url));

function loadPageSrc(platform: 'ios' | 'android', name:string[]) {
  const filePath = path.join(FIXTURE_ROOT, 'page-src', platform, ...name);
  return fs.readFileSync(filePath);
}

describe('verify-page on universal *ios*', () => {
  const ios_src = {
    '00': loadPageSrc('ios', ['universal', 'page-source-ios-00.xml']).toString(),
    '00-diff': loadPageSrc('ios', ['universal', 'page-source-ios-00-diff-layout.xml']).toString(),
    '01': loadPageSrc('ios', ['universal', 'page-source-ios-01.xml']).toString(),
  };

  it('calcOverlapRatio()', () => {
    let node = parsePageSrc(ios_src['01']);

    let res = calcOverlapRatio(node, { filterAttributes: { visible: true } });
    // vertically & horizontally overlapped items
    expect(res.filter((e) => e.verticalOverlap > 0.7 && e.horizontalOverlap >= 0.25).length).toBe(1);
  });

  it('comparePageLayout()', async () => {
    let node = parsePageSrc(ios_src['00']);

    const res = getPageLayout(node);
    expect(res.length).toBe(4);

    // clear .layout
    await cleanPageLayout(testQAConfig);

    const options: Parameters<typeof comparePageLayout>[1] = {
      config: testQAConfig,
      id: 'universal ios test',
    };

    // no layout info
    expect(await readPageLayout(options.config, options.id)).toBeFalsy();

    // should save new layout
    let res2 = await comparePageLayout(node, options);
    expect(res2.diff).toEqual([]);
    expect(await readPageLayout(options.config, options.id)).toBeTruthy();

    // should get diff
    let nodeDiffNodes = parsePageSrc(ios_src['00-diff']);
    res2 = await comparePageLayout(nodeDiffNodes, options);
    expect(res2.diff.length).toBe(1);
    expect(res2.diff[0]).toEqual({op: 'replace', path: '/0/rect/2', value: 200});
    expect(res2.layout[0]['rect'][2]).toBe(200);

    // should get layout items from the compare result
    const diffItem = getDiffLayoutItems(res2);
    expect(diffItem.length).toBe(res2.diff.length);
    expect(diffItem[0]).toEqual({ tag: 'Element', rect: [0, 0, 200, 100] });
  
    // should update layout
    options.updateLayout = true;
    res2 = await comparePageLayout(nodeDiffNodes, options);
    expect(res2.diff.length).toBe(1);
    res2 = await comparePageLayout(nodeDiffNodes, options);
    expect(res2.diff).toEqual([]);
  });

});

describe('verify-page on universal *android*', () => {
  const android_src = {
    '00': loadPageSrc('android', ['universal', 'page-source-android-00.xml']).toString(),
    '00-diff': loadPageSrc('android', ['universal', 'page-source-android-00-diff-layout.xml']).toString(),
    '01': loadPageSrc('android', ['universal', 'page-source-android-01.xml']).toString(),
  };
  
  it('calcOverlapRatio()', () => {
    let node = parsePageSrc(android_src['01']);

    let res = calcOverlapRatio(node, { filterAttributes: { visible: true } });
    // vertically & horizontally overlapped items
    expect(res.filter((e) => e.verticalOverlap > 0.7 && e.horizontalOverlap >= 0.25).length).toBe(1);
  });

  it('comparePageLayout()', async () => {
    let node = parsePageSrc(android_src['00']);

    const res = getPageLayout(node);
    expect(res.length).toBe(2);

    // clear .layout
    await cleanPageLayout(testQAConfig);

    const options: Parameters<typeof comparePageLayout>[1] = {
      config: testQAConfig,
      id: 'universal android test',
    };

    // should save new layout
    let res2 = await comparePageLayout(node, options);
    expect(res2.diff).toEqual([]);
    expect(await readPageLayout(options.config, options.id)).toBeTruthy();

    // should get diff
    let nodeDiff = parsePageSrc(android_src['00-diff']);
    res2 = await comparePageLayout(nodeDiff, options);
    expect(res2.diff.length).toBe(1);
    expect(res2.diff[0]).toEqual({op: 'replace', path: '/0/rect/2', value: 1000});
  });

});
