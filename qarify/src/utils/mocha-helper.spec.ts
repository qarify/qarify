import path from 'path';
import url from 'url';
import Mocha from 'mocha';
import { expect } from 'expect-webdriverio';
import { getTestSuiteNode } from "./mocha-helper.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('spec-info', function() {
  it('should return empty spec node', async function() {
    const res = getTestSuiteNode(new Mocha());
    expect(res.children).toBeFalsy();
  });

  it('should return valid spec node', async function() {
    const mocha = new Mocha();
    mocha.addFile(path.resolve(__dirname, '__mock', 'spec-data.js'));
    await mocha.loadFilesAsync();

    const res = getTestSuiteNode(mocha);
    expect(res.children?.length).toBe(2);
  
    const firstSuite = res.children?.find((e) => e.type === 'suite');
    expect(firstSuite).toBeDefined();
    expect(firstSuite?.title).toBe('# suite 1');
    expect(firstSuite?.path).toEqual(['']);
    expect(firstSuite?.children?.length).toBe(1);
  
    const firstTest = firstSuite?.children?.find((e) => e.type === 'test');
    expect(firstTest).toBeDefined();
    expect(firstTest?.title).toBe('## test 1-1');
    expect(firstTest?.path).toEqual(['', '# suite 1']);
    expect(firstTest?.children).toBeFalsy();
  });
});
