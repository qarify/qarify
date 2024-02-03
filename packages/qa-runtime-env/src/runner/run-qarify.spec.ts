import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { setLogLevelName } from '@qarify/logger';

import { runQArify } from './run-qarify.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../../fixtures', import.meta.url));
const _dataDir = path.join(FIXTURE_ROOT, 'spec-files');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './runner-spec-files/3-pass.spec.js',
  './runner-spec-files/4-fail.spec.js',
];

describe('run-qarify', () => {
  before(() => {
    setLogLevelName('silent');
  });

  it('should run *js* spec files', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: allSpecFiles,
    });
    const specs = allSpecFiles.map(e => path.join(_dataDir, e));

    const res = await runQArify(specs, config, { runnerId: '' });
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });
});