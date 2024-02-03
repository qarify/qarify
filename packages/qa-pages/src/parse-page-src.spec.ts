import fs from 'fs';
import url from 'url';
import path from 'path';
import { expect } from 'expect-webdriverio';

import {
  parsePageSrc, 
} from './page-node.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../fixtures', import.meta.url));
const PAGE_SRC_ROOT = path.join(FIXTURE_ROOT, 'page-src');

function loadPageSrc(file: string) {
  return fs.readFileSync(file).toString();
}

function listFiles(dirPath: string, ext: string = '') {
  const res = fs.readdirSync(dirPath);
  if (ext) {
    return res.filter((e) => e.endsWith(`.${ext}`));
  } else {
    return res.filter((e) => !e.startsWith('.'));
  }
}

describe('parse page src', () => {

  it('should parse android page source', () => {
    const baseDir = path.join(PAGE_SRC_ROOT, 'android');
    const dirs = listFiles(baseDir);
    for (const dir of dirs) {
      const files = listFiles(path.join(baseDir, dir), 'xml');
      for (const file of files) {
        const src = loadPageSrc(path.join(baseDir, dir, file));
        const res = parsePageSrc(src);
        expect(res.children.length).toBeTruthy();
      }
    }
  });

  it('should parse ios page source', () => {
    const baseDir = path.join(PAGE_SRC_ROOT, 'ios');
    const dirs = listFiles(baseDir);
    for (const dir of dirs) {
      const files = listFiles(path.join(baseDir, dir), 'xml');
      for (const file of files) {
        const src = loadPageSrc(path.join(baseDir, dir, file));
        const res = parsePageSrc(src);
        expect(res.children.length).toBeTruthy();
      }
    }
  });

});
