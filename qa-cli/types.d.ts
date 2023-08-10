// import type { CodeRunnerFramework } from './dist';

type QAConnectionInfo = {
  id: string;
  name: string;
  protocol: 'http' | 'https';
  hostname: string;
  port: number;
  path: string;
  capabilities: any;
  sessionId?: string;
};

type QATestSuite = {
  name: string;
  specs: string[];
};

type QATestOptions = {
  mochaOptions?: Mocha.MochaOptions;
  // ms to wait for expectation to succeed
  waitforTimeout?: number;
  // interval between attempts
  waitforInterval?: number;
};

type QAProject = {
  id: string;
  name: string;
  connection: QAConnectionInfo;

  testSuites: QATestSuite[];
  options?: QATestOptions;
};

type QAConfig = {
  rootDir?: string;
  cacheDir: string;
  tsconfig?: string;
  projects: Array<QAProject>;
  framework: SpecRunnerFramework;
  options: QATestOptions;
};

declare var browser: WebdriverIO.Browser
declare var driver: WebdriverIO.Browser
declare var multiremotebrowser: WebdriverIO.MultiRemoteBrowser
