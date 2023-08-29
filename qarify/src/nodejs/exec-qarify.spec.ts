import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { prepareSpecs } from './prepare-specs.js';
import { execQArify } from './exec-qarify.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _dataDir = path.join(__dirname, '__mock');

describe('exec-qarify', () => {
  it('should run .js spec files', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./spec-files/*.js'],
    });

    const specs = await prepareSpecs(config);
    expect(specs.length).toBeTruthy();

    const res = await execQArify(specs, config, {}, {}, '../dist/nodejs/run-qarify.js'); // based src root
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });

  it('should run .ts spec files after build', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./spec-files/*.ts'],
      tsconfig: path.join(_dataDir, 'tsconfig.json'),
      forceBuild: true,
    });

    const specs = await prepareSpecs(config);
    expect(specs.length).toBeTruthy();

    const res = await execQArify(specs, config, {}, {}, '../dist/nodejs/run-qarify.js'); // based src root
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });

  it('should run .ts spec files with ts-node', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./spec-files/*.ts'],
      tsconfig: path.join(_dataDir, 'tsconfig.json'),
      nodeOptions: [
        "--no-warnings",
        "--loader=ts-node/esm"
      ],
      forceBuild: false,
    });

    const specs = await prepareSpecs(config);
    expect(specs.length).toBeTruthy();

    const res = await execQArify(specs, config, {}, {}, '../dist/nodejs/run-qarify.js'); // based src root
    expect(res.length).toBeTruthy();
    expect(res[0].failed).toBe(1);
  });
});
