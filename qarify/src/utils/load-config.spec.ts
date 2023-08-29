import path from "node:path";
import url from 'url';
import { expect } from 'expect-webdriverio';
import type { QAConfig } from "@qarify/types";
import { SpecRunnerFramework } from "@qarify/types";

import { loadConfig } from "./load-config.js";
import { getDefaultQAConfig } from '../../tests/helper/default-qaconfig.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const _baseDir = path.join(__dirname, '__mock');

describe('load-config', () => {
  it('should load default config', async () => {
    const baseDir = path.join(_baseDir, 'load-default-config');
    let res = await loadConfig(baseDir);
    expect(res).toEqual({
      ...getDefaultQAConfig(baseDir),
      config: path.join(baseDir, '.qarify.json'),
    });

    const noConfigRootDir = '/';
    res = await loadConfig(noConfigRootDir);
    expect(res).toEqual(getDefaultQAConfig(noConfigRootDir));
  });

  it('should load config in config file', async () => {
    let res =await loadConfig(_baseDir, { config: 'qarify-bdd.json'});
    expect(res).toEqual({
      ...getDefaultQAConfig(_baseDir),
      config: path.join(_baseDir, 'qarify-bdd.json'),
      framework: SpecRunnerFramework.mocha_bdd, // <== vaule in 'qarify-bdd.json'
    });

    // override with cli options
    res =await loadConfig(_baseDir, { config: 'qarify-bdd.json', framework: SpecRunnerFramework.mocha_tdd});
    expect(res).toEqual({
      ...getDefaultQAConfig(_baseDir),
      config: path.join(_baseDir, 'qarify-bdd.json'),
      framework: SpecRunnerFramework.mocha_tdd, // <== value in cli options
    });
  });

  it('should load config in package.json', async () => {
    const baseDir = path.join(_baseDir, 'load-from-package');
    let res =await loadConfig(baseDir, {});
    expect(res).toEqual({
      ...getDefaultQAConfig(baseDir),
      config: path.join(baseDir, 'package.json'),
      specs: [ "./qa/specs/*.ts" ], // <== value in package.json#qarify
    });
    
    // override with cli options
    res =await loadConfig(baseDir, { specs: [ "./specs/*.ts" ] });
    expect(res).toEqual({
      ...getDefaultQAConfig(baseDir),
      config: path.join(baseDir, 'package.json'),
      specs: [ "./specs/*.ts" ], // <== value in cli options
    });
  });

});
