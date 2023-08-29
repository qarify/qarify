import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { runQArify } from './run-qarify.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _dataDir = path.join(__dirname, '__mock');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './spec-files/3-pass.spec.js',
  './spec-files/4-fail.spec.js',
];

describe('run-qarify', () => {
  it('should run *js* spec files', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: allSpecFiles,
    });
    const specs = allSpecFiles.map(e => path.join(_dataDir, e));

    const res = await runQArify(specs, config);
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });
});