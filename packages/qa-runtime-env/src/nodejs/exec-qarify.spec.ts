import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { setLogLevelName } from '@qarify/logger';

import { prepareSpecs } from './prepare-specs.js';
import { execQArify } from './exec-qarify.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../../fixtures', import.meta.url));
const _dataDir = path.join(FIXTURE_ROOT, 'spec-files');

describe('exec-qarify', () => {
  before(() => {
    setLogLevelName('silent');
  });

  it('should run .js spec files', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./nodejs-spec-files/*.js'],
    });

    const specs = await prepareSpecs(config);
    expect(specs.length).toBeTruthy();

    const res = await execQArify(specs, config, { runnerId: '' }, {}, '../dist/nodejs/run-qarify.js'); // based src root
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });

  it('should run .ts spec files after build', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./nodejs-spec-files/*.ts'],
      tsconfig: path.join(_dataDir, 'nodejs-spec-files', 'tsconfig.json'),
      forceBuild: true,
    });

    const specs = await prepareSpecs(config);
    expect(specs.length).toBeTruthy();

    const res = await execQArify(specs, config, { runnerId: '' }, {}, '../dist/nodejs/run-qarify.js'); // based src root
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });

  it('should run .ts spec files with ts-node', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./nodejs-spec-files/*.ts'],
      tsconfig: path.join(_dataDir, 'nodejs-spec-files', 'tsconfig.json'),
      nodeOptions: [
        "--no-warnings",
        "--loader=ts-node/esm"
      ],
      forceBuild: false,
    });

    const specs = await prepareSpecs(config);
    expect(specs.length).toBeTruthy();

    const res = await execQArify(specs, config, { runnerId: '' }, {}, '../dist/nodejs/run-qarify.js'); // based src root
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });
});
