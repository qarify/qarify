import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { setLogLevelName } from '@qarify/logger';
import { runSpecFiles } from './run-specs.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';
import { setGlobalExpect } from '../index.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../fixtures', import.meta.url));
const _dataDir = path.join(FIXTURE_ROOT, 'spec-files');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './runner-spec-files/1-pass.spec.js',
  './runner-spec-files/2-fail.spec.js',
];

describe('run-specs', () => {
  before(() => {
    setLogLevelName('silent');
  });

  it('should run *js* spec files', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: allSpecFiles,
    });
    const specs = allSpecFiles.map(e => path.join(_dataDir, e));

    // we should set 'expect' manually
    setGlobalExpect();

    const res = await runSpecFiles({ ...config, specs, runnerId: 'run-specs-test' });
    expect(res).toBeDefined();
    expect(res.failed).toBe(1);
  });

});