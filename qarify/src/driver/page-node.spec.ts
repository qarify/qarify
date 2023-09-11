import fs from 'fs';
import url from 'url';
import { expect } from 'expect';

import {
  parsePageSrc, findPageNode, findPageNodePlatform, findPageNodeWindowSize
} from './page-node.js';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function loadPageSrc(platform: 'ios' | 'android', name:string) {
  const filePath = path.join(__dirname, '__mock', platform, name);
  return fs.readFileSync(filePath);
}

const ios_src = {
  '00': loadPageSrc('ios', 'page-source-ios-00.xml').toString(),
  '01': loadPageSrc('ios', 'page-source-ios-01.xml').toString(),
};

const android_src = {
  '00': loadPageSrc('android', 'page-source-android-00.xml').toString(),
  '01': loadPageSrc('android', 'page-source-android-01.xml').toString(),
};

describe('xml2js on *ios*', () => {
  // it('should save to xml', () => {
  //   fs.writeFileSync(
  //     path.join(__dirname, '__mock', 'ios', 'page-source-ios-scroll.xml'),
  //     JSON.parse(loadPageSrc('ios', 'page-source-ios-scroll.json').toString()).value
  //   );
  // });

  it('should parse xml', () => {
    const res = parsePageSrc(ios_src['00']);
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();
  });

  it('should find node', () => {
    const node = parsePageSrc(ios_src['00']);

    let res = findPageNode(node, ''); // root
    expect(res?.tagName).toBe('UI');

    res = findPageNode(node, '0'); // app root
    expect(res?.tagName).toBe('App');

    res = findPageNode(node, '0.0'); // window
    expect(res?.tagName).toBe('Window');

    res = findPageNode(node, '0.0.0'); // element
    expect(res?.tagName).toBe('Element');

    expect(findPageNodePlatform(node)).toBe('ios');
    expect(findPageNodeWindowSize(node)).toBeDefined();
  });
});

describe('xml2js on *android*', () => {
  it('should parse xml', () => {
    const res = parsePageSrc(android_src['00']);
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();
  });

  it('should find node', () => {
    const node = parsePageSrc(android_src['00']);

    let res = findPageNode(node, ''); // root
    expect(res?.tagName).toBe('UI');

    res = findPageNode(node, '0'); // root view
    expect(res?.tagName).toBe('View');

    res = findPageNode(node, '0.0'); // child view
    expect(res?.tagName).toBe('View');

    expect(findPageNodePlatform(node)).toBe('android');
    expect(findPageNodeWindowSize(node)).toBeDefined();
  });
});
