import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import { findSpecFiles } from './find-spec-files.js';
import { prepareSpecs } from './prepare-specs.js';
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../../fixtures', import.meta.url));
const _dataDir = path.join(FIXTURE_ROOT, 'spec-files');

describe('prepare-specs', () => {
  it('should not build with foceBuild === false', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./nodejs-spec-files/*.ts'],
      tsconfig: path.join(_dataDir, 'nodejs-spec-files', 'tsconfig.json'),
      forceBuild: false,
    });
    const expectedFiles = findSpecFiles(config.specs, config.rootDir).sort();
    
    const res = await prepareSpecs(config);
    expect(res.sort()).toEqual(expectedFiles);
  });

  it('should build with foceBuild === true', async () => {
    const config = getDefaultQAConfig(_dataDir, {
      specs: ['./nodejs-spec-files/*.ts'],
      tsconfig: path.join(_dataDir, 'nodejs-spec-files', 'tsconfig.json'),
      forceBuild: true,
    });
    const expectedFiles = findSpecFiles(config.specs, config.rootDir).sort().map((e) =>(
      path.join(config.cacheDir, 'out', path.basename(e, '.ts') + '.js')
    ));
    
    const res = await prepareSpecs(config);
    expect(res.sort()).toEqual(expectedFiles);
  });
});
