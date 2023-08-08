
export type QAConnectionInfo = {
  id: string;
  name: string;
  protocol: 'http' | 'https';
  hostname: string;
  port: number;
  path: string;
  capabilities: any;
};

export type QATestSuite = {
  name: string;
  specs: string[];
}

export type QAProject = {
  id: string;
  name: string;
  connection: QAConnectionInfo;

  testSuites: QATestSuite[];
};

export const enum CodeRunnerFramework {
  mocha_bdd = 'Mocha BDD',
  mocha_tdd = 'Mocha TDD',
  mocha_qunit = 'Mocha QUnit',
  mocha_export = 'Mocha Exports',
  js_eval = 'Normal Script',
}

export type QAConfig = {
  rootDir?: string;
  cacheDir: string;
  tsconfig?: string;
  projects: Array<QAProject>;
  mochaOptions?: Mocha.MochaOptions;
  framework: CodeRunnerFramework;
};
