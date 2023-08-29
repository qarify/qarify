import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { runSpecFiles } from './run-specs.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';
import { setGlobalExpect, setLogLevel } from '../index.js';
import { LogLevel } from '@qarify/types';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _dataDir = path.join(__dirname, '__mock');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './spec-files/1-pass.spec.js',
  './spec-files/2-fail.spec.js',
];

describe('run-specs', () => {
  before(() => {
    // setLogLevel(LogLevel.debug, true);
  });

  it('should run *js* spec files', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: allSpecFiles,
    });
    const specs = allSpecFiles.map(e => path.join(_dataDir, e));

    // we should set 'expect' manually
    setGlobalExpect();

    const res = await runSpecFiles(specs, config, 'run-specs-test');
    expect(res).toBeDefined();
    expect(res.failed).toBe(1);
  });

});