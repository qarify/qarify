import path from "node:path";
import url from 'url';
import { expect } from 'expect-webdriverio';
import { QAConfig, SpecRunnerFramework } from "@qarify/types";

import { loadConfig } from "./load-config.js";
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';
import { GLOBAL_CONFIG } from "../constants.js";
import { _getGlobal } from "../global/index.js";

// internal global
declare global {
  var __qaconfig__: QAConfig
}

const FIXTURE_ROOT = url.fileURLToPath(new URL('../../../fixtures', import.meta.url));
const _baseDir = path.join(FIXTURE_ROOT, 'config-files');

describe('load-config', () => {
  it('should load default config', async () => {
    // load from file
    const baseDir = path.join(_baseDir, 'load-default-config');
    let res = await loadConfig(baseDir);
    expect(res).toEqual({
      ...getDefaultQAConfig(baseDir),
      config: path.join(baseDir, '.qarify.json'),
    });
    // compare with global
    expect(res).toEqual(globalThis[GLOBAL_CONFIG]);

    // load 
    const noConfigRootDir = '/';
    res = await loadConfig(noConfigRootDir);
    expect(res).toEqual(getDefaultQAConfig(noConfigRootDir));
    // compare with global
    expect(res).toEqual(globalThis[GLOBAL_CONFIG]);
  });

  it('should load config from specified config file', async () => {
    let res = await loadConfig(_baseDir, { config: 'qarify-bdd.json'});
    expect(res).toEqual({
      ...getDefaultQAConfig(_baseDir),
      config: path.join(_baseDir, 'qarify-bdd.json'),
      framework: SpecRunnerFramework.mocha_bdd, // <== vaule in 'qarify-bdd.json'
    });

    // override with cli options
    res = await loadConfig(_baseDir, { config: 'qarify-bdd.json', framework: SpecRunnerFramework.mocha_tdd});
    expect(res).toEqual({
      ...getDefaultQAConfig(_baseDir),
      config: path.join(_baseDir, 'qarify-bdd.json'),
      framework: SpecRunnerFramework.mocha_tdd, // <== value in cli options
    });
  });

  it('should load config from package.json', async () => {
    const baseDir = path.join(_baseDir, 'load-from-package');
    let res = await loadConfig(baseDir, {});
    expect(res).toEqual({
      ...getDefaultQAConfig(baseDir),
      config: path.join(baseDir, 'package.json'),
      specs: [ "./qa/specs/*.ts" ], // <== value in package.json#qarify
    });
    
    // override with cli options
    res = await loadConfig(baseDir, { specs: [ "override.ts" ] });
    expect(res).toEqual({
      ...getDefaultQAConfig(baseDir),
      config: path.join(baseDir, 'package.json'),
      specs: [ "override.ts" ], // <== value in cli options
    });
  });

  it('should throw error for invalid config file', async () => {
    let res = loadConfig(_baseDir, { config: 'error-configs/qarify-invalid-version.json' });
    await expect(res).rejects.toThrow(/invalid version/);

    res = loadConfig(_baseDir, { config: 'error-configs/qarify-no-version.json' });
    await expect(res).rejects.toThrow(/no version/);

    res = loadConfig(_baseDir, { config: 'error-configs/qarify-not-supported-version.json' });
    await expect(res).rejects.toThrow(/not supported version/);
  });

  it('should set global variable', async () => {
    const noConfigRootDir = '/';
    const res = await loadConfig(noConfigRootDir);
    expect(_getGlobal(GLOBAL_CONFIG)).toEqual(res);
    expect(globalThis[GLOBAL_CONFIG]).toEqual(res);
  })

});
