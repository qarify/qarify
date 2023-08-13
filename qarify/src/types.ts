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

export type QAConnectionInfo = {
  id: string;
  name: string;
  protocol: 'http' | 'https';
  hostname: string;
  port: number;
  path: string;
  capabilities: any;
  sessionId?: string;
};

export type QATestSuite = {
  name: string;
  specs: string[];
};

export type QATestOptions = {
  connection?: QAConnectionInfo;

  mochaOptions?: Mocha.MochaOptions;
  // ms to wait for expectation to succeed
  waitforTimeout?: number;
  // interval between attempts
  waitforInterval?: number;
};

export type QAProject = {
  id: string;
  name: string;

  testSuites?: QATestSuite[];
  options?: QATestOptions;
};

export type QAConfig = {
  rootDir: string;
  cacheDir: string;
  tsconfig: string;
  projects: Array<QAProject>;
  framework: SpecRunnerFramework;
  options: QATestOptions;
};
