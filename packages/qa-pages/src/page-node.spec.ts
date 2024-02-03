import fs from 'fs';
import url from 'url';
import path from 'path';
import { expect } from 'expect-webdriverio';
import XPath from 'xpath';
import { FindStrategy, type QAPageNodeSelector } from '@qarify/types';

import {
  getPageDoc, getPageSrcFormat,
  PAGE_TAG_MAP,
  parsePageSrc, findPageNode, findPageNodePlatform, findPageWindowSize,
  getOptimalXPath, findPageNodeScrollPosition, getLocators,
  filterPageNode,
} from './page-node.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../fixtures', import.meta.url));

function loadPageSrc(platform: 'ios' | 'android', name:string[]) {
  const filePath = path.join(FIXTURE_ROOT, 'page-src', platform, ...name);
  return fs.readFileSync(filePath);
}

function rnpPageSrcFiles(platform: 'ios' | 'android', format: 'universal' | 'ios' | 'android') {
  const dir = path.join(FIXTURE_ROOT, 'page-src', platform, `rnp-${format}`);
  return fs.readdirSync(dir).map((e) => path.join(dir, e));
}

describe('page-node on universal *ios*', () => {
  const ios_src = {
    '00': loadPageSrc('ios', ['universal', 'page-source-ios-00.xml']).toString(),
    '01': loadPageSrc('ios', ['universal', 'page-source-ios-01.xml']).toString(),
  };
  
  it('should parse xml', () => {
    let res = parsePageSrc(ios_src['00']);
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();
    expect(getPageSrcFormat()).toBe('universal');
    expect(findPageNodePlatform(res)).toBe('ios');
    expect(findPageWindowSize(res)).toEqual({
      width:390, height:844
    });

    // const files = rnpPageSrcFiles('ios', 'universal');
    // for (const file of files) {
    //   res = parsePageSrc(fs.readFileSync(file).toString());
    //   expect(getPageSrcFormat()).toBe('universal');
    //   expect(res).toBeDefined();
    //   expect(res.children.length).toBeTruthy();
    //   expect(findPageNodePlatform(res)).toBe('ios');
    //   expect(findPageNodeWindowSize(res)).toEqual({
    //     width:390, height:844
    //   });
    // }
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

    res = findPageNode(node, '0.0.0.0'); // PickerInput
    expect(res?.tagName).toBe('PickerInput');
  });

  it('should get optimal xpath', () => {
    parsePageSrc(ios_src['00']);
    const doc = getPageDoc()!;

    let res = getOptimalXPath(doc);
    expect(res).toBe('');

    let ele = XPath.select('//UI/App/Window/Element', doc) as Node[];
    res = getOptimalXPath(doc, ele[0] as Element);
    expect(res).toBe('//App[@axId=\"iossample\"]/Window[1]/Element');

    ele = XPath.select('//UI/App/Window/Element/PickerInput', doc) as Node[];
    res = getOptimalXPath(doc, ele[0] as Element);
    expect(res).toBe('//PickerInput[@axId=\"Dropdown picker\"]');    
  });

  it('should get locators(selectors)', () => {
    const pageNode = parsePageSrc(ios_src['00'], { xpath: true });

    let res: Array<QAPageNodeSelector>;

    let ele = findPageNode(pageNode, '0'); // App
    expect(ele?.xpath).toBe('//App[@axId="iossample"]');

    res = getLocators(ele!.attributes);
    expect(res[0]).toEqual({
      strategy: FindStrategy.AccessibilityId,
      locator: 'iossample'
    });

    ele = findPageNode(pageNode, '0.0.0.0'); // PickerInput
    expect(ele?.xpath).toBe('//PickerInput[@axId="Dropdown picker"]');
    res = getLocators(ele!.attributes);
    expect(res[0]).toEqual({
      strategy: FindStrategy.AccessibilityId,
      locator: 'Dropdown picker'
    });
  });

  it('filterPageNode()', () => {
    let node = parsePageSrc(ios_src['00']);
    // filter nothing
    let res = filterPageNode(node, {});
    expect(res.length).toBe(9);
    // filter sub node
    res = filterPageNode(findPageNode(node, '0.1')!, {});
    expect(res.length).toBe(1);

    // filter leafOnly
    res = filterPageNode(node, { leafOnly: true });
    expect(res.length).toBe(4);

    // filter hasText
    res = filterPageNode(node, { hasText: true });
    expect(res.length).toBe(1);
    expect(res[0].tagName).toBe('App');
    res = filterPageNode(node, { hasText: true, leafOnly: true });
    expect(res.length).toBe(0);

    // filter hasValue
    res = filterPageNode(node, { hasValue: true });
    expect(res.length).toBe(1);
    expect(res[0].tagName).toBe('PickerInput');

    // filter hasAxId
    res = filterPageNode(node, { hasAxId: true });
    expect(res.length).toBe(2);

    // filter attr.accessible
    res = filterPageNode(node, { attributes: { accessible: true } });
    expect(res.length).toBe(4);
    res = filterPageNode(node, { leafOnly: true, attributes: { accessible: true } });
    expect(res.length).toBe(3);

    node = parsePageSrc(ios_src['01']);
    res = filterPageNode(node, { leafOnly: true, attributes: { accessible: true } });
    expect(res.length).toBe(3);
  });

  it('findPageNodeScrollPosition()', () => {
    // no scroll values
    let node = parsePageSrc(ios_src['00']);
    let res = findPageNodeScrollPosition(node);
    expect(res).toEqual({
      verticalValue: 0,
      verticalPages: 1,
      horizontalValue: 0,
      horizontalPages: 1,
    });
    
    // has scroll values
    node = parsePageSrc(ios_src['01']);
    res = findPageNodeScrollPosition(node);
    expect(res).toEqual({
      verticalValue: 10,
      verticalPages: 3,
      horizontalValue: 0,
      horizontalPages: 1,
    });
  });
});

describe('page-node on universal *android*', () => {
  const android_src = {
    '00': loadPageSrc('android', ['universal', 'page-source-android-00.xml']).toString(),
    '01': loadPageSrc('android', ['universal', 'page-source-android-01.xml']).toString(),
  };
  
  it('should parse xml', () => {
    let res = parsePageSrc(android_src['00']);
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();
    expect(getPageSrcFormat()).toBe('universal');
    expect(findPageNodePlatform(res)).toBe('android');
    expect(findPageWindowSize(res)).toEqual({
      width:1080, height:1857
    });

    const files = rnpPageSrcFiles('android', 'universal');
    for (const file of files) {
      res = parsePageSrc(fs.readFileSync(file).toString());
      expect(getPageSrcFormat()).toBe('universal');
      expect(res).toBeDefined();
      expect(res.children.length).toBeTruthy();
      expect(findPageNodePlatform(res)).toBe('android');
      expect(findPageWindowSize(res)).toEqual({
        width:1080, height:1857
      });
    }
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
    expect(findPageWindowSize(node)).toBeDefined();
  });
});

describe('page-node on sample *ios*', () => {
  const ios_src = {
    '00': loadPageSrc('ios', ['sample-ios', 'sample-main-view.xml']).toString(),
    '01': loadPageSrc('ios', ['sample-ios', 'sample-detail-view.xml']).toString(),
  };

  it('should parse xml', () => {
    let res = parsePageSrc(ios_src['00']);
    expect(getPageSrcFormat()).toBe('ios');
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();

    res = parsePageSrc(ios_src['01']);
    expect(getPageSrcFormat()).toBe('ios');
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();

    // const files = rnpPageSrcFiles('ios', 'ios');
    // for (const file of files) {
    //   res = parsePageSrc(fs.readFileSync(file).toString());
    //   expect(getPageSrcFormat()).toBe('ios');
    //   expect(res).toBeDefined();
    //   expect(res.children.length).toBeTruthy();
    // }
  });

  it('should find node', () => {
    const node = parsePageSrc(ios_src['00']);

    let res = findPageNode(node, ''); // root
    expect(res?.tagName).toBe(PAGE_TAG_MAP['ios']['ROOT']);

    res = findPageNode(node, '0'); // app root
    expect(res?.tagName).toBe(PAGE_TAG_MAP['ios']['App']);

    expect(findPageNodePlatform(node)).toBe('ios');
    expect(findPageWindowSize(node)).toBeDefined();
  });

});

describe('page-node on sample *android*', () => {
  const ios_src = {
    '00': loadPageSrc('android', ['sample-android', 'sample-main-view.xml']).toString(),
    '01': loadPageSrc('android', ['sample-android', 'sample-detail-view.xml']).toString(),
  };

  it('should parse xml', () => {
    let res = parsePageSrc(ios_src['00']);
    expect(getPageSrcFormat()).toBe('android');
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();

    res = parsePageSrc(ios_src['01']);
    expect(getPageSrcFormat()).toBe('android');
    expect(res).toBeDefined();
    expect(res.children.length).toBeTruthy();

    // const files = rnpPageSrcFiles('android', 'android');
    // for (const file of files) {
    //   res = parsePageSrc(fs.readFileSync(file).toString());
    //   expect(getPageSrcFormat()).toBe('android');
    //   expect(res).toBeDefined();
    //   expect(res.children.length).toBeTruthy();
    // }
  });

  it('should find node', () => {
    const node = parsePageSrc(ios_src['00']);

    let res = findPageNode(node, ''); // root
    expect(res?.tagName).toBe(PAGE_TAG_MAP['android']['ROOT']);

    res = findPageNode(node, '0')!; // root view
    expect(res.tagName).toBe(PAGE_TAG_MAP['android']['App']);
    expect(res.attributes).toEqual({
      index:"0",
      'class':"android.widget.FrameLayout",
      text:"",
      displayed:"true",
      visible: true,
      checkable:"false",
      checked:"false",
      clickable:"false",
      enabled:true,
      focusable:"false",
      focused:"false",
      'long-clickable':"false",
      password:"false",
      scrollable:"false",
      selected:"false",
      bounds:"[0,0][1080,1857]",
      x: 0, y: 0, width: 1080, height: 1857,
    });

    expect(findPageNodePlatform(node)).toBe('android');
    expect(findPageWindowSize(node)).toBeDefined();
  });

});
