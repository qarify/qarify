import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import {
  runQARunner,
} from "../../src/runner/index.js";
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';
import { QADriver, QARunner } from '@qarify/types';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _dataDir = path.join(__dirname, '__mock');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './spec-files/5-runner.spec.js',
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

  it("should set global qyrunner", async function() {
    const qaconfig = getDefaultQAConfig('.');
    const qarunner: QARunner = {
      ...qaconfig,
      specs: allSpecFiles.map(e => path.join(_dataDir, e)),
      drivers: [{ name: 'runner test' } as QADriver],
      runnerId: 'test',
    };
    const res = await runQARunner(qarunner);
    expect(res).toEqual([{ runnerId: res[0].runnerId, failed: 0 }]);
  });
});
