import type {
  CLIOptions, QAConfig, QARunnerOptions, QArifyResult
} from "@qarify/types";

import { isBrowser } from '../utils/index.js';

type PrepareSpecs = (config: QAConfig) => Promise<string[]>;
type ExecQArify = (
  files: string[], config: QAConfig, options: QARunnerOptions, cliOptions?: CLIOptions, execFileName?: string
) => Promise<QArifyResult[]>;

type LoadConfig = (
  baseDir: string,
  options?: CLIOptions,
) => Promise<QAConfig>;
type LoadConfigByPath = (configPath: string) => Promise<QAConfig>;

const _IS_BROWSER_ENV_ = isBrowser();

export const runtimePrepareSpecs: Promise<PrepareSpecs> = 
(_IS_BROWSER_ENV_ ? import('../browser/index.js') : import('../nodejs/index.js')).then((mod) => mod.prepareSpecs);

export const runtimeExecQArify: Promise<ExecQArify> = 
(_IS_BROWSER_ENV_ ? import('../browser/index.js') : import('../nodejs/index.js')).then((mod) => mod.execQArify);

export const runtimeLoadConfig: Promise<LoadConfig> = 
(_IS_BROWSER_ENV_ ? import('../browser/index.js') : import('../nodejs-loader/index.js')).then((mod) => mod.loadConfig);

export const runtimeLoadConfigByPath: Promise<LoadConfigByPath> = 
(_IS_BROWSER_ENV_ ? import('../browser/index.js') : import('../nodejs-loader/index.js')).then((mod) => mod.loadConfigByPath);
