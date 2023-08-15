import Mocha, { type InterfaceContributions } from "mocha";
import url from "node:url";

import type { QAConfig, QAProject, QATestSuite } from "../types.js";
import { TestReporter } from "./test-reporter.js";

const FILE_PROTOCOL = "file://";

export async function executeTestSuite(
  testSuite: QATestSuite,
  project: Required<QAProject>,
  config: QAConfig,
  runnerId: string
) {
  const mocha = await initRunner(testSuite, project, config);
  return run(mocha, runnerId);
}

export async function initRunner(
  testSuite: QATestSuite,
  project: Required<QAProject>,
  config: QAConfig,
) {
  const { framework } = config;
  const { mochaOptions = {} } = project.options;
  const { specFiles } = testSuite;
  const _mochaOpt = {
    ...mochaOptions,
    ui: framework.split(" ")[1].toLowerCase() as keyof InterfaceContributions,
  };
  const mocha = new Mocha(_mochaOpt);
  mocha.fullTrace();

  specFiles.forEach((spec) =>
    mocha.addFile(
      spec.startsWith(FILE_PROTOCOL) ? url.fileURLToPath(spec) : spec
    )
  );

  try {
    await mocha.loadFilesAsync();
  } catch (err) {
    console.error(err);
    throw err;
  }

  return mocha;
}

export async function run(
  mocha: Mocha,
  runnerId: string
) {

  mocha.reporter(TestReporter, { runnerId });

  let runtimeError;
  const result = await new Promise((resolve) => {
    let _runner;
    try {
      _runner = mocha.run(resolve);
    } catch (err: any) {
      runtimeError = err;
      return resolve(1);
    }
  });

  if (runtimeError) {
    throw runtimeError;
  }

  return result;
}
