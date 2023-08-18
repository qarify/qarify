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

export type QADriver = {
  id: string;
  name: string;
  protocol: "http" | "https";
  hostname: string;
  port: number;
  path: string;
  capabilities: any;
  sessionId?: string;
};

export type QArifyResult = {
  name: string;
  driver?: string;
  failed: number;
};

export type QAConfig = {
  // display name
  name: string;

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

export type CLIOptions = Partial<QAConfig> & {
  config?: string;
};
