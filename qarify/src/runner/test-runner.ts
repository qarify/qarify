import Mocha, { type InterfaceContributions } from "mocha";
import url from "node:url";
import debug from 'debug';

import { SpecRunnerFramework } from '../constants.js';
import type { QAConfig, } from "../types.js";
import { TestReporter } from "./test-reporter.js";
import { getModuleType } from "../utils/platform.js";

const FILE_PROTOCOL = "file://";
const log = debug('qarify:runner:runner');

export async function runSpecFiles(
  files: string[],
  config: QAConfig,
  runnerId: string
) {
  const mocha = await initRunner(files, config.framework, config.mochaOptions, runnerId);
  const failed = await runRunner(mocha);
  return {
    runnerId,
    failed,
  };
}

export async function initRunner(
  files: string[],
  framework: SpecRunnerFramework,
  mochaOptions: Mocha.MochaOptions | undefined,
  runnerId: string,
) {
  const _mochaOpt = {
    ...(mochaOptions || {}),
    parallel: false,
    ui: framework.split('-')[1].toLowerCase() as keyof InterfaceContributions,
  };

  const mocha = new Mocha(_mochaOpt);
  if (!_mochaOpt.reporter) {
    mocha.reporter(TestReporter, { runnerId });
  }
  mocha.fullTrace();

  log('specs to run:', files);
  files.forEach((spec) =>
    mocha.addFile(
      spec.startsWith(FILE_PROTOCOL) ? url.fileURLToPath(spec) : spec
    )
  );

  if (getModuleType() === 'module') {
    log('load files async');
    try {
      await mocha.loadFilesAsync();
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    log('files will be loaded sync');
  }

  return mocha;
}

function _disposeSuites(suite: Mocha.Suite) {
  if (suite.suites) {
    suite.suites.forEach((s) => _disposeSuites(s));
  }
  suite.dispose();
}

export async function runRunner(mocha: Mocha, dispose = true) {
  let runtimeError;

  const result = await new Promise<number>((resolve) => {
    try {
      const _runner = mocha.run((res) => {
        if (dispose) {
          _disposeSuites(_runner.suite);
          _runner.dispose();
          try {
            mocha.dispose();
          } catch {/* IGNORE */}
        }
        log('runRunner() DONE with', res);
        resolve(res);
      });
    } catch (err: any) {
      log('runRunner() error', err.message);
      runtimeError = err;
      return resolve(1);
    }
  });

  if (runtimeError) {
    throw runtimeError;
  }

  return result;
}
