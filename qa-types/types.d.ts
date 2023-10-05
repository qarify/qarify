/// <reference types="node" />
/// <reference types="mocha" />

import type { AttachOptions } from 'webdriver';
import type { Capabilities } from '@wdio/types';

import type { LogLevel, SpecRunnerEvent, SpecRunnerFramework, FindStrategy } from './dist/index.js';

export * from './dist/index.js';

export type QATestAttach = {
  type: string;
  body: any;
};

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
  attached?: QATestAttach[];
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
  // runner id
  runnerId: string;

  // specify driver name to run
  drivers?: string[];

  // execQArify()로 실행 시 사용되는 report
  // forked runner와 IPC를 통해 전달받은 메시지를 재전달한다.
  execReporter?: QARunnerReporter;

  // whether not to kill main process
  keepMainProcess?: boolean;
};

export type QAConfig = {
  // QAConfig version
  version: string;

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

  // script framework
  scriptFramework?: {
    // script type. default value is qyaction
    type?: 'qyaction' | 'wdio';
  };
};

export type CLIOptions = Partial<QAConfig> & {
  logLevel?: keyof typeof LogLevel;

  // whether to run in ci-mode
  ci?: boolean;

  forceFork?: boolean;
};

export type QARunner = QAConfig & {
  context?: {
    framework?: Mocha;
    instance?: Mocha.Runner;
  };
  runnerId: string;
};

export type QAPageNodeAttribute = {
  visible?: boolean;     // boolean
  accessible?: boolean;  // boolean
  x?: number;           // number
  y?: number;           // number
  width?: number;       // number
  height?: number;      // number
  axId?: string;
  text?: string;
  id?: string;
  value?: string;
  label?: string;       // legacy but used

  //
  // Legacy props
  //
  name?: string;
  // e.g. [x1,y1,x2,y2]
  bounds?: string;
  type?: string;
  enabled?: string;
  index?: string;
  'content-desc'?: string;
  rntestid?: string;
  'resource-id'?: string;
  'class'?: string;
};

export type QAPageNode = {
  tagName: string;
  path: string;
  attributes: QAPageNodeAttribute;
  children: QAPageNode[];
  xpath?: string;
  title?: string;
};

export type QAPageRefreshOptions = {
  parsing?: boolean,
  screenshot?: boolean
};

export type QATestPlugin = {
  
};

export type QAReportPlugin = {

};

export type QAPageNodeSelector = {
  strategy: FindStrategy,
  locator: string,
};
