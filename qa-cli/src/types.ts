
export type Task = {
  id: string;
  name: string;
  path: string;
};

export type Spec = {
  id: string;
  name: string;
  path: string;
};

export type QAConnectionInfo = {
  id: string;
  name: string;
  protocol: 'http' | 'https';
  hostname: string;
  port: number;
  path: string;
  capabilities: any;
};

export type QATestCase = {
  id: string;
  name: string;
  preTasks: Array<Task>;
  specs: Array<Spec>;
  postTasks: Array<Task>;
};

export type QATestSuite = {
  id: string;
  name: string;
  testCases: Array<QATestCase>;
}

export type QAProject = {
  id: string;
  name: string;
  connection: QAConnectionInfo;

  testSuite: QATestSuite;
};

export type QAConfig = {
  rootDir?: string;
  specsDir: string;
  tasksDir: string;
  cacheDir: string;
  type: 'module' | 'commonjs';
  tsconfig?: string;
  projects: Array<QAProject>;
};
