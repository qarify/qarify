import path from 'node:path';
import url from 'node:url';
import { expect } from 'expect-webdriverio';
import {
  runQARunner,
  getQARunner,
  getQARunnerProp,
} from "../../src/runner/index.js";
import { localDriver, getDefaultQAConfig } from '../helper/default-qaconfig.js';
import { QARunner } from '@qarify/types';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _dataDir = path.join(__dirname, '__mock');

// N.B.
// we should test different files for each test 
// because of the mocha dispose issue
const allSpecFiles = [
  './spec-files/1-pass.spec.js',
  // './spec-files/2-fail.spec.js',
];

describe("runner", () => {
  it("should run with driver", async function() {
    this.timeout(10000); // 10s
    const qaconfig = getDefaultQAConfig(_dataDir, {
      specs: allSpecFiles.map(e => path.join(_dataDir, e)),
      drivers: [localDriver],
    });
    const qarunner: QARunner = {
      ...qaconfig,
      runnerId: 'test',
    };
    const res = await runQARunner(qarunner);
    expect(res).toEqual([{ runnerId: res[0].runnerId, failed: 0}]);
  });
});
