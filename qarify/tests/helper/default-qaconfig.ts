import path from "node:path";
import type { QAConfig } from "@qarify/types";
import { SpecRunnerFramework } from "@qarify/types";

export const getDefaultQAConfig = (baseDir: string, override: Partial<QAConfig> = {}): QAConfig => ({
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
