import Mocha, { type InterfaceContributions } from "mocha";
import url from "node:url";

import type { QAConfig, QAProject, QATestSuite } from "../types.js";
import { TestReporter } from "./test-reporter.js";

const FILE_PROTOCOL = "file://";

export async function runSpecFiles(
  files: string[],
  config: QAConfig,
  runnerId: string
) {
  const mocha = await initRunner(files, config);
  return runMocha(mocha, runnerId);
}

export async function initRunner(
  files: string[],
  config: QAConfig,
) {
  const { framework, mochaOptions = {} } = config;
  const _mochaOpt = {
    ...mochaOptions,
    ui: framework.split('-')[1].toLowerCase() as keyof InterfaceContributions,
  };
  const mocha = new Mocha(_mochaOpt);
  mocha.fullTrace();

  files.forEach((spec) =>
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

export async function runMocha(
  mocha: Mocha,
  runnerId: string
) {

  mocha.reporter(TestReporter, { runnerId });

  let runtimeError;
  const result = await new Promise<number>((resolve) => {
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
