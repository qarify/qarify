import fs from "node:fs";
import path from "node:path";
import url from 'url';
import { expect } from 'expect-webdriverio';

import { loadConfig } from "./load-config.js";
import { QAConfig } from "../types.js";
import { SpecRunnerFramework } from "../constants.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _baseDir = path.join(__dirname, '__mock');

const getDefaultConfig = (baseDir: string): QAConfig => ({
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
});

describe('load-config', () => {
  it('should load default config', async () => {
    const baseDir = path.join(_baseDir, 'load-default-config');
    let res = await loadConfig(baseDir);
    expect(res).toEqual(getDefaultConfig(baseDir));

    const noConfigRootDir = '/';
    res = await loadConfig(noConfigRootDir);
    expect(res).toEqual(getDefaultConfig(noConfigRootDir));
  });

  it('should load config in config file', async () => {
    let res =await loadConfig(_baseDir, { config: 'qarify-bdd.json'});
    expect(res).toEqual({ ...getDefaultConfig(_baseDir), framework: SpecRunnerFramework.mocha_bdd });

    // override with cli options
    res =await loadConfig(_baseDir, { config: 'qarify-bdd.json', framework: SpecRunnerFramework.mocha_tdd});
    expect(res).toEqual({ ...getDefaultConfig(_baseDir), framework: SpecRunnerFramework.mocha_tdd });
  });

  it('should load config in package.json', async () => {
    const baseDir = path.join(_baseDir, 'load-from-package');
    let res =await loadConfig(baseDir, {});
    expect(res).toEqual({ ...getDefaultConfig(baseDir), specs: [ "./qa/specs/*.ts" ] });
    
    // override with cli options
    res =await loadConfig(baseDir, { specs: [ "./specs/*.ts" ] });
    expect(res).toEqual({ ...getDefaultConfig(baseDir), specs: [ "./specs/*.ts" ] });
  });

});
