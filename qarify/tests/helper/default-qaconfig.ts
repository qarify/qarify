import path from "node:path";
import type { QAConfig } from "@qarify/types";
import { SpecRunnerFramework } from "@qarify/types";
import { MAX_SUPPORT_VERSION } from "../../src/constants.js";

export const getDefaultQAConfig = (baseDir: string, override: Partial<QAConfig> = {}): QAConfig => ({
  version: `${(MAX_SUPPORT_VERSION / 10000).toFixed(0)}.${MAX_SUPPORT_VERSION % 1000}`,
  name: 'default',
  rootDir: baseDir,
  cacheDir: path.join(baseDir, '.qycache'),
  framework: SpecRunnerFramework.mocha_qunit,
  specs: [],
  drivers: [],
  testOptions: {
    waitforTimeout: 5000,
    waitforInterval: 1000,
  },
  ...override,
});
