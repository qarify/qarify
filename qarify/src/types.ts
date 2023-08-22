import type { EventEmitter } from "events";
import type { AttachOptions } from 'webdriver';
import type { Capabilities } from '@wdio/types';
import type { SpecRunnerEvent, SpecRunnerFramework } from "./constants";

export type ReportMessage = {
  runnerId: string;
  type: SpecRunnerEvent;
  title: string;
  titles: string[];
  file?: string; // defined when hook:*, test:*
  duration?: number; // defined when *:end, test:pass, test:fail
  error?: Error;
  stats: {
    passed: number;
    failed: number;
  };
};

export type TestSuiteNode = {
  type: 'test' | 'suite';
  title: string;
  path: string[];
  file?: string;
  children?: TestSuiteNode[];
};

export type QADriverSession = Omit<AttachOptions, 'capabilities'> & {
  capabilities: Capabilities.Capabilities;
  mjpegScreenshotUrl?: string;
  isAndroid: boolean;
  isIOS: boolean;
};

export type QADriver = {
  id: string;
  name: string;
  protocol: "http" | "https";
  hostname: string;
  port: number;
  path: string;
  capabilities: any;
  session?: QADriverSession;
};

export type QArifyResult = {
  runnerId: string;
  failed: number;
};

export interface QARunnerReporter extends EventEmitter {
  setOptions: (options?: Mocha.MochaOptions) => void;
}

export type QARunnerOptions = {
  // specify driver name to run
  drivers?: string[];
  isForked?: boolean;
  reporter?: QARunnerReporter;
};

export type QAConfig = {
  // display name
  name: string;

  // config file path
  // it may not be defined, meaning there is no config file
  config?: string;

  // base directory.
  // default는 config file directory or working directory
  rootDir: string;

  // cache directory for build output
  // default는 '.qycache'
  cacheDir: string;

  // test framework.
  // available value는 'mocha-bdd', 'mocha-tdd', 'mocha-qunit'.
  // default는 'mocha-qunit'
  framework: SpecRunnerFramework;

  // path of spec files
  specs: string[];

  // test options
  testOptions: {
    // ms to wait for expectation to succeed
    waitforTimeout?: number;
    // interval between attempts
    waitforInterval?: number;
  };
  // mocha options
  mochaOptions?: Mocha.MochaOptions;

  // tsconfig path for compile typescript
  tsconfig?: string;

  // node options
  // e.g. ts-node esm loader
  // ['--loader=ts-node/esm']
  // e.g. ts-node register
  // ['--require=ts-node/register']
  nodeOptions?: string[];

  // whether to force build spec files
  forceBuild?: boolean;

  // drivers to use while testing
  drivers: QADriver[];
};

export type CLIOptions = Partial<QAConfig>;
