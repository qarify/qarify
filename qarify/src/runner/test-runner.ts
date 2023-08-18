import Mocha, { type InterfaceContributions } from "mocha";
import url from "node:url";

import { SpecRunnerFramework } from '../constants.js';
import type { QAConfig, } from "../types.js";
import { TestReporter } from "./test-reporter.js";

const FILE_PROTOCOL = "file://";

export async function runSpecFiles(
  files: string[],
  config: QAConfig,
  runnerId: string
) {
  const mocha = await initRunner(files, config.framework, config.mochaOptions, runnerId);
  return runRunner(mocha);
}

export async function initRunner(
  files: string[],
  framework: SpecRunnerFramework,
  mochaOptions: Mocha.MochaOptions | undefined,
  runnerId: string,
) {
  const _mochaOpt = {
    ...(mochaOptions || {}),
    ui: framework.split('-')[1].toLowerCase() as keyof InterfaceContributions,
  };

  const mocha = new Mocha(_mochaOpt);
  if (!_mochaOpt.reporter) {
    mocha.reporter(TestReporter, { runnerId });
  }
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

export async function runRunner(mocha: Mocha, dispose = true) {
  let runtimeError;

  const result = await new Promise<number>((resolve) => {
    try {
      let _runner = mocha.run((res) => {
        if (dispose) {
          _runner.dispose();
        }
        resolve(res);
      });
    } catch (err: any) {
      runtimeError = err;
      return resolve(1);
    }
  });

  if (dispose) {
    mocha.dispose();
  }

  if (runtimeError) {
    throw runtimeError;
  }

  return result;
}
