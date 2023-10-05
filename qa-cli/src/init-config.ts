import {type SpawnOptions, type ChildProcess, spawn} from 'node:child_process';
import { getLogger, isSilent } from '@qarify/logger';
import fs from 'node:fs';
import path from 'node:path';

import type { CLIInitOptions } from './cli.js';
import {
  loadConfig, applyInitialCLIOptions
} from "qarify";
import { QAConfig } from '@qarify/types';

const DEFAULT_CONFIG_FILE_NAME = '.qarify.json';
const DEFAULT_BASE_DIR_NAME = 'qa';
const DEFAULT_SPEC_DIR_NAME = 'specs';
const TSCONFIG_TEMPLATE = `{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ESNext",
    /* Modules */
    "module": "ESNext",
    "noEmit": true,
    "allowJs": true,
    "checkJs": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "NodeNext",
    "types": [
      "node", "mocha", "@qarify/globals"
    ]
  }
}
`;

const deps = [
  '@types/mocha',
  '@qarify/globals',
];

const log = getLogger('init');

export async function initConfig(options: CLIInitOptions, baseDir: string) {
  try {
    const { overwrite, ..._options} = options;
    const config = await loadConfig(baseDir, _options);
    const configPath = config.config || path.join(config.rootDir, DEFAULT_CONFIG_FILE_NAME);
    if (fs.existsSync(configPath) && !overwrite) {
      if (!isSilent()) {console.log(`'${DEFAULT_CONFIG_FILE_NAME}' file already exists.`)}
      return;
    }
    log('configPath:', configPath);
  
    if (!isSilent()) console.log('Initialize QArify under', config.rootDir);
    let count = 0;
    //
    // base directory
    let baseDirName = DEFAULT_BASE_DIR_NAME;
    while (fs.existsSync(path.join(config.rootDir, baseDirName))) {
      baseDirName = `${DEFAULT_BASE_DIR_NAME}_${count++}`;
    }
    const basePath = path.join(config.rootDir, baseDirName);
    log('basePath:', basePath);
    //
    // specs directory
    const specDirPath = path.join(basePath, DEFAULT_SPEC_DIR_NAME);
    fs.mkdirSync(specDirPath, {recursive: true});
    //
    // spec files
    config.specs = [`${specDirPath}/*.js`];
    //
    // tsconfig file
    const tsconfigPath = path.join(basePath, 'tsconfig.json');
    config.tsconfig = tsconfigPath;
    fs.writeFileSync(tsconfigPath, TSCONFIG_TEMPLATE);

    //
    // install deps
    if (!isSilent()) console.log('Install dependencies...', deps.join(', '));
    await installDeps(config.rootDir);

    //
    // save config
    fs.writeFileSync(configPath, JSON.stringify(applyRelativePath(config, ['rootDir', 'config']), null, 2));

    if (!isSilent()) console.log('✔ Done', config.rootDir);
  } catch (e) {
    if (!isSilent()) {console.error(e);}
    process.exit(1);
  }
}

function applyRelativePath(config: QAConfig, omitProps?: Array<keyof QAConfig>) {
  const { rootDir } = config;
  const pathProps: Array<keyof QAConfig> = ['cacheDir', 'tsconfig'];
  const specsProp = 'specs' as keyof QAConfig;
  (Object.keys(config) as Array<keyof QAConfig>).forEach((k) => {
    if (pathProps.indexOf(k) >= 0) {
      if (path.isAbsolute(config[k] as string)) {
        (config[k] as string) = (config[k] as string).replace(rootDir, '.')
      }
    } else if (k === specsProp) {
      (config[specsProp] as string[]).forEach((e, i) => {
        if (path.isAbsolute(e)) {
          (config[specsProp] as string[])[i] = e.replace(rootDir, '.');
        }
      })
    }
  });
  if (omitProps) {
    omitProps.forEach((k) => k in config && delete config[k]);
  }
  return  config;
}

async function installDeps(cwd: string) {
  if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    throw new Error('No package.json file exists');
  }
  const proc = spawn(`npm`, ['install', '--save-dev', ...deps], { cwd, stdio: 'inherit' });
  const promise = new Promise<NodeJS.Signals | number>((resolve, reject,) => {
    proc.on('exit', (code, signal) => {
      if (code || signal) {
        reject(code || signal);
      } else {
        resolve(code || 0);
      }
    });
  });
  return promise;
}