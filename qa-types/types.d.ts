/// <reference types="node" />
/// <reference types="mocha" />

export * from './dist/index';
import type { LogLevel, SpecRunnerEvent, SpecRunnerFramework } from './dist/index';

declare type AttachOptions = { }
declare namespace Capabilities {
  type Capabilities = { }
}

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

export interface QARunnerReporter extends NodeJS.EventEmitter {
  report: (type: SpecRunnerEvent, message: ReportMessage) => void;
}

export type QAReporterOptions = Mocha.MochaOptions['reporterOptions'] & {
  runnerId?: string;

  // 전달받고자 하는 QARunnerReporter instance
  qaReporter?: QARunnerReporter;

  // execQArify()로 실행 시 true로 설정됨
  isForked?: boolean;
};

export interface QAFrameworkOption extends Omit<Mocha.MochaOptions, 'reporterOptions'> {
  reporterOptions?: QAReporterOptions;
}

export type QARunnerOptions = {
  // specify driver name to run
  drivers?: string[];

  // execQArify()로 실행 시 사용되는 report
  // forked runner와 IPC를 통해 전달받은 메시지를 재전달한다.
  execReporter?: QARunnerReporter;

  // whether not to kill main process
  keepMainProcess?: boolean;
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

  // test framework options
  frameworkOptions?: QAFrameworkOption;

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

  // whether to ignore no spec files to run
  ignoreNoFiles?: boolean;
};

export type CLIOptions = Partial<QAConfig> & {
  logLevel?: keyof typeof LogLevel;

  // whether to run in ci-mode
  ci?: boolean;

  forceFork?: boolean;
};
