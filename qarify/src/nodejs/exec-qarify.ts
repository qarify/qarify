import {type SendHandle, type Serializable, spawn} from 'node:child_process';
import path from 'node:path';
import type { CLIOptions, QAConfig, QARunnerOptions, QArifyResult, ReportMessage } from "@qarify/types";
import { SpecRunnerEvent } from '@qarify/types';
import { getLogger, isSilent } from '@qarify/logger';

import _dirname from '../dirname/index.js';
import { printMessage, updateExecConfig } from '../utils/helpers.js';

const log = getLogger('nodejs:exec-qarify');

export async function execQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions,
  cliOptions: CLIOptions = {},
  execFileName = './nodejs/run-qarify.js', // <== based src root directory
) {
  return new Promise<QArifyResult[]>(async (resolve, reject) => {
    const dirname = await _dirname();
    const runnerPath = path.resolve(dirname, execFileName);

    const {
      config: _config, nodeOptions, reporter, qaReporter, options: _options
    } = updateExecConfig(config, files, options);

    const rawConfig = JSON.stringify(_config);
    const rawOptions = JSON.stringify(_options);
    const rawCliOptions = JSON.stringify(cliOptions);

    const args = [];

    if (nodeOptions && nodeOptions.length) {
      args.push(...nodeOptions);
    }
    args.push(runnerPath, rawConfig, rawOptions, rawCliOptions);
    log('args:', args);

    const env = { ...(Object.entries(process.env).reduce((acc, [k, v]) => {
      if (!k.startsWith('npm_') && !k.startsWith('VSCODE_')) {
        acc[k] = v;
      }
      return acc;
    }, {} as any)) };
    if (_config.tsconfig) { env.TS_NODE_PROJECT = _config.tsconfig; };
    log('env:', env);

    const eventNames = qaReporter && qaReporter.eventNames();
    if (qaReporter) {
      log('qaReporter events:', eventNames);
      if (reporter) {
        if (!isSilent()) {
          console.warn('qaReporter will replace frameworkOptions.reporter');
        }
      }
    } else {
      log('no qaReporter');
      if (reporter) {
        return reject(new Error('frameworkOptions.reporter is not allowed on exec mode'));
      }
    }

    const proc = spawn('node', args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'], env, cwd: _config.rootDir,
    });

    const result: QArifyResult[] = [];
    proc.on('message', (message: Serializable, sendHandle: SendHandle) => {
      const { type } = message as ReportMessage;
      if (eventNames) {
        if (eventNames.length === 0 || eventNames.indexOf(type) >= 0) {
          qaReporter.report(type, message as ReportMessage);
          // reporter.emit(type, type, message);
        }
      } else {
        printMessage(type, message as ReportMessage);
      }
      if (type === SpecRunnerEvent.run_end) {
        const { runnerId, stats } = message as ReportMessage;
        result.push({
          runnerId, failed: stats.failed
        });
      }
    });

    proc.on('exit', (code, signal) => {
      log('child process is terminating, keepMainProcess =', !!options.keepMainProcess, `, code=${code}, signal=${signal}`);
      if (code || signal) {
        reject(code || 1);
      } else {
        resolve(result);
      }
    });
    // TODO: set listeners for child process
    //_setListeners(proc, parallel);
  });
}

/*
function _setListeners(proc: ChildProcess, parallel?: boolean) {
  // terminate children.
  process.on('SIGINT', () => {
    // XXX: a previous comment said this would abort the runner, but I can't see that it does
    // anything with the default runner.
    log('main process caught SIGINT');
    proc.kill('SIGINT');
    // if running in parallel mode, we will have a proper SIGINT handler, so the below won't
    // be needed.
    if (!parallel) {
      // win32 does not support SIGTERM, so use next best thing.
      if (require('os').platform() === 'win32') {
        proc.kill('SIGKILL');
      } else {
        // using SIGKILL won't cleanly close the output streams, which can result
        // in cut-off text or a befouled terminal.
        log('sending SIGTERM to child process');
        proc.kill('SIGTERM');
      }
    }
  });
}
*/