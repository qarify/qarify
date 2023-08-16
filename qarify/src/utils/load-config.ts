import fs from "node:fs";
import path from "node:path";
import debug from 'debug';

import type { CLIOptions, QAConfig } from "../types.js";
import { SpecRunnerFramework } from "../constants.js";

const log = debug('qarify:utils:load-config');

const _defaultOptions: Partial<QAConfig> = {
  name: 'default',
  cacheDir: ".qycache",

  framework: SpecRunnerFramework.mocha_qunit,
  specs: [],
  testOptions: {
    waitforTimeout: 5000,
    waitforInterval: 1000,
  },

  drivers: [],
};

/**
 * load user config
 *
 * ## config lookup order
 * 1. config file if specified
 * 2. '.qarify.json' file if exists
 * 3. package.json#qarify if exists
 * 4. minimal config
 *
 * ## root directory
 * 1. user defined absolute directory
 * 2. config's basedir if config file is specified
 * 3. package.json's basedir if package.json#qarify exists
 * 4. specified baseDir
 *
 * @param baseDir absolute base directory
 * @param options load options
 * @returns loaded user config object
 */
export async function loadConfig(
  baseDir: string,
  options?: CLIOptions,
): Promise<QAConfig> {
  let { config: configFile, ..._options } = options || {};
  let userConfig = {} as QAConfig;

  if (_options.cacheDir && !path.isAbsolute(_options.cacheDir)) {
    _options.cacheDir = path.join(baseDir, _options.cacheDir);
  }
  if (_options.tsconfig && !path.isAbsolute(_options.tsconfig)) {
    _options.tsconfig = path.join(baseDir, _options.tsconfig);
  }
  log('options:', options || 'no options');

  if (configFile) {
    if (!path.isAbsolute(configFile)) {
      configFile = path.join(baseDir, configFile);
    }
    if (!fs.existsSync(configFile)) {
      throw new Error("Not found: " + configFile);
    }
    if (configFile.endsWith(".json")) {
      userConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } else {
      userConfig = (await import(path.resolve(configFile))).default;
    }
    baseDir = path.dirname(configFile);
  } else {
    configFile = path.join(baseDir, ".qarify.json");
    if (fs.existsSync(configFile)) {
      log('found config file,', configFile);
      userConfig = JSON.parse(
        fs.readFileSync(configFile, "utf-8")
      );
    } else {
      //
      // try to load config from package.json
      const packageJSON = findPackageJSON(baseDir);
      if (packageJSON) {
        log('found package.json,', packageJSON);
        const pack = JSON.parse(fs.readFileSync(packageJSON, "utf-8"));
        if (pack["qarify"]) {
          userConfig = pack["qarify"];
          baseDir = path.dirname(packageJSON);
        }
      }
    }
  }

  // config priority: default < config file < cli options
  userConfig = Object.assign({}, _defaultOptions, userConfig, _options);
  if (!userConfig.rootDir) {
    userConfig.rootDir = baseDir;
  }
  if (!path.isAbsolute(userConfig.rootDir)) {
    userConfig.rootDir = path.join(baseDir, userConfig.rootDir);
  }
  if (!path.isAbsolute(userConfig.cacheDir!)) {
    userConfig.cacheDir = path.join(baseDir, userConfig.cacheDir!);
  }
  if (userConfig.tsconfig && !path.isAbsolute(userConfig.tsconfig)) {
    userConfig.tsconfig = path.join(baseDir, userConfig.tsconfig);
  }
  log('loaded config:', userConfig);

  return userConfig;
}

function findPackageJSON(dir: string) {
  do {
    const pack = path.join(dir, "package.json");
    if (fs.existsSync(pack)) {
      return pack;
    }
    dir = path.dirname(dir);

    // / => ['', '']
    // C:\\ => ['C:', '']
  } while (dir.split(path.sep)[1]);

  return null;
}
