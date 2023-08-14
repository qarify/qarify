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
  const { framework } = config;
  const { mochaOptions = {} } = project.options;
  const { specs } = testSuite;
  const _mochaOpt = {
    ...mochaOptions,
    ui: framework.split(" ")[1].toLowerCase() as keyof InterfaceContributions,
  };
  const mocha = new Mocha(_mochaOpt);
  mocha.reporter(TestReporter, { runnerId });
  mocha.fullTrace();

  specs.forEach((spec) =>
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
