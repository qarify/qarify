import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import {
  runQARunner,
} from "./runner.js";
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';
import { QADriverOptions, QARunner } from '@qarify/types';
import { GLOBAL_RUNNER } from '../constants.js';
import { _getGlobal } from '../global/index.js';

// internal global
declare global {
  var __qyrunner__: QARunner
}

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../../fixtures', import.meta.url));
const _dataDir = path.join(FIXTURE_ROOT, 'spec-files');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './runner-spec-files/5-runner.spec.js',
];

describe("runner", () => {
  it("should throw when no specs", async function() {
    const qaconfig = getDefaultQAConfig('.');
    const qarunner: QARunner = {
      ...qaconfig,
      specs: [],
      runnerId: 'test',
    };
    await expect(runQARunner(qarunner)).rejects.toThrow(/no spec files/i);
  });

  it("should return when no drivers", async function() {
    const qaconfig = getDefaultQAConfig('.');
    const qarunner: QARunner = {
      ...qaconfig,
      specs: allSpecFiles.map(e => path.join(_dataDir, e)),
      drivers: [],
      runnerId: 'test',
    };
    expect(await runQARunner(qarunner)).toEqual([]);
  });

  it("should unset global qyrunner", async function() {
    const qaconfig = getDefaultQAConfig('.');
    const qarunner: QARunner = {
      ...qaconfig,
      specs: allSpecFiles.map(e => path.join(_dataDir, e)),
      drivers: [{ name: 'runner test' } as QADriverOptions],
      runnerId: 'test',
    };
    // no global runner before test
    expect(globalThis[GLOBAL_RUNNER]).toBeUndefined();
    expect(_getGlobal(GLOBAL_RUNNER)).toBeUndefined();
    // the global runner will be tested in the spec file
    const res = await runQARunner(qarunner);
    expect(res).toEqual([{ runnerId: res[0].runnerId, failed: 0 }]);

    // no global runner after test
    expect(globalThis[GLOBAL_RUNNER]).toBeUndefined();
    expect(_getGlobal(GLOBAL_RUNNER)).toBeUndefined();
  });
});
