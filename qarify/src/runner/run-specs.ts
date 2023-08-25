import Mocha, { type InterfaceContributions } from "mocha";
import url from "node:url";
import type { QAConfig, SpecRunnerFramework } from "@qarify/types";

import { TestReporter } from "./reporter.js";
import { getModuleType } from "../utils/platform.js";
import { getLogger, isSilent } from "../logger/logger.js";

const FILE_PROTOCOL = "file://";
const log = getLogger('runner:run-specs');

export async function runSpecFiles(
  files: string[],
  config: QAConfig,
  runnerId: string
) {
  const mocha = await initFramework(files, config.framework, config.frameworkOptions, runnerId);
  const failed = await runFramework(mocha);
  return {
    runnerId,
    failed,
  };
}

export async function initFramework(
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
  if (!_mochaOpt.reporter) {
    _mochaOpt.reporter = TestReporter;
  }
  if (!_mochaOpt.reporterOptions) { _mochaOpt.reporterOptions = {}; }
  _mochaOpt.reporterOptions.runnerId = runnerId;

  log('mochaOpt:', _mochaOpt);

  const mocha = new Mocha(_mochaOpt);
  mocha.fullTrace();

  log('add files:', files);
  files.forEach((spec) =>
    mocha.addFile(
      spec.startsWith(FILE_PROTOCOL) ? url.fileURLToPath(spec) : spec
    )
  );

  if (getModuleType() === 'module') {
    log('load files async');
    try {
      await mocha.loadFilesAsync();
    } catch (e) {
      if (!isSilent()) { console.error(e); }
      throw e;
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

export async function runFramework(mocha: Mocha, dispose = true) {
  let runtimeError;

  log('run framework... dispose =', dispose);
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
        log('DONE with', res);
        resolve(res);
      });
    } catch (err: any) {
      log('EXCEPTION: ', err.message);
      runtimeError = err;
      return resolve(1);
    }
  });

  if (runtimeError) {
    throw runtimeError;
  }

  return result;
}
