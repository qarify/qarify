import fs from "node:fs";
import path from "node:path";
import type { CLIOptions, QAConfig } from "@qarify/types";
import { SpecRunnerFramework } from "@qarify/types";
import { getLogger } from '@qarify/logger';

import { MAX_SUPPORT_VERSION, GLOBAL_CONFIG } from "../constants.js";
import { isValidConfigVersion, validateConfigValues } from "../utils/helpers.js";
import { _setGlobal } from "../global/index.js";

const log = getLogger('utils:load-config');

const _defaultOptions: Partial<QAConfig> = {
  version: `${(MAX_SUPPORT_VERSION / 10000).toFixed(0)}.${MAX_SUPPORT_VERSION % 1000}`,
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
  let { config: configFile, ..._options } = options || {} as CLIOptions;
  let userConfig = {..._options} as QAConfig;

  if (_options.cacheDir && !path.isAbsolute(_options.cacheDir)) {
    _options.cacheDir = path.join(baseDir, _options.cacheDir);
  }
  if (_options.tsconfig && !path.isAbsolute(_options.tsconfig)) {
    _options.tsconfig = path.join(baseDir, _options.tsconfig);
  }
  log('options:', options || 'no options');

  if (configFile) {
    //
    // load config from specified config file
    //
    if (!path.isAbsolute(configFile)) {
      configFile = path.join(baseDir, configFile);
    }
    if (!fs.existsSync(configFile)) {
      throw new Error("Not found: " + configFile);
    }
    if (configFile.endsWith(".json")) {
      userConfig = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    } else {
      userConfig = (await import(/*@vite-ignore*/path.resolve(configFile))).default;
    }
    baseDir = path.dirname(configFile);
  } else {
    const defaultConfig = path.join(baseDir, ".qarify.json");
    if (fs.existsSync(defaultConfig)) {
      //
      // load config from default config file
      //
      log('found config file,', defaultConfig);
      configFile = defaultConfig;
      userConfig = JSON.parse(
        fs.readFileSync(configFile, "utf-8")
      );
    } else {
      //
      // try to load config from package.json
      const packageJSON = _findPackageJSON(baseDir);
      let loaded = false;
      if (packageJSON) {
        log('found package.json,', packageJSON);
        const pack = JSON.parse(fs.readFileSync(packageJSON, "utf-8"));
        if (pack["qarify"]) {
          //
          // load config from package.json file
          //
          userConfig = pack["qarify"];
          configFile = packageJSON;
          loaded = true;
        }
      }
      if (!loaded) {
        //
        // load config from empty directory
        //
        userConfig.version = _defaultOptions.version!;
      }
    }
    if (configFile) {
      baseDir = path.dirname(configFile);
    }
  }

  if (!userConfig.version) {
    throw new Error('no version');
  }
  // config priority: default < config file < cli options
  userConfig = Object.assign({}, _defaultOptions, userConfig, _options);

  // check version
  isValidConfigVersion(userConfig.version);

  // check directory and files
  if (!userConfig.rootDir) {
    userConfig.rootDir = baseDir;
  }
  if (configFile) {
    userConfig.config = configFile;
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

  // validate values
  validateConfigValues(userConfig);

  log('loaded config:', userConfig);

  // set global config
  _setGlobal(GLOBAL_CONFIG, userConfig);

  return userConfig;
}

/**
 * load QAConfig
 * @param configPath QArify directory or QArify config file
 * @returns QAConfig
 */
export async function loadConfigByPath(configPath: string) {
  try {
    const stat = fs.statSync(configPath);
    if (stat.isDirectory()) {
      return loadConfig(configPath);
    }
    return loadConfig(path.dirname(configPath), { config: configPath });
  } catch (e) {
    throw e;
  }
}

function _findPackageJSON(dir: string) {
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
