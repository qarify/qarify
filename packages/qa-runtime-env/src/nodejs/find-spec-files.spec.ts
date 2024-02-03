import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { findSpecFiles } from './find-spec-files.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../fixtures', import.meta.url));
const _dataDir = path.join(FIXTURE_ROOT, 'spec-files');

const allSpecFiles = [
  '1-pass.spec.ts',
  '2-fail.spec.ts',
  '3-pass.spec.js',
  '4-fail.spec.js',
];

describe('find-spec-files', () => {
  it('should return empty array', () => {
    // empty dir
    let res = findSpecFiles(['./empty-spec-files/*'], _dataDir);
    expect(res).toEqual([]);

    // empty search result
    res = findSpecFiles(['./nodejs-spec-files/*.cjs'], _dataDir);
    expect(res).toEqual([]);

    // not existing file
    res = findSpecFiles(['./nodejs-spec-files/not-existing.spec.js'], _dataDir);
    expect(res).toEqual([]);
  });

  it('should return some files', () => {
    const baseDir = path.join(_dataDir, 'nodejs-spec-files');
    const someFiles = allSpecFiles.filter(e => e.endsWith('.ts')).sort();
    const searchResult = someFiles.map((e) => path.join(baseDir, e)).sort();

    // with file name
    let res = findSpecFiles(someFiles, baseDir);
    expect(res).toEqual(searchResult);

    // with absolute file name
    res = findSpecFiles(searchResult, baseDir);
    expect(res).toEqual(searchResult);
  
    // with search pattern
    res = findSpecFiles(['*.ts'], baseDir);
    expect(res.sort()).toEqual(searchResult)
  });

  it('should return all files', () => {
    const baseDir = path.join(_dataDir, 'nodejs-spec-files');
    const allFiles = allSpecFiles.sort();
    const searchResult = allFiles.map((e) => path.join(baseDir, e)).sort();

    // with file name
    let res = findSpecFiles(allFiles, baseDir);
    expect(res).toEqual(searchResult);

    // with absolute file name
    res = findSpecFiles(searchResult, baseDir);
    expect(res).toEqual(searchResult);
  
    // with search pattern
    res = findSpecFiles(['*.spec.*'], baseDir);
    expect(res.sort()).toEqual(searchResult)
  });

});