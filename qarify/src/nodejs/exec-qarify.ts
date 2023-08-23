import {SendHandle, Serializable, spawn} from 'child_process';
import path from 'path';
import debug from 'debug';

import type { QAConfig, QARunnerOptions, ReportMessage } from "../types.js";
import _dirname from '../dirname/index.js';
import { _DEBUG_QUARIFY } from '../constants.js';
import { updateExecConfig } from '../utils/helpers.js';

const log = debug('qarify:nodejs:exec-qarify');
if (_DEBUG_QUARIFY) {
  log.enabled = true;
}

export async function execQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions = {},
  parallel = false,
  execFileName = './nodejs/run-qarify.js',
) {
  return new Promise<number>(async (resolve, reject) => {
    const dirname = await _dirname();
    const runnerPath = path.resolve(dirname, execFileName);

    const {
      config: _config, nodeOptions, reporter, qaReporter, options: _options
    } = updateExecConfig(config, files, options);

    const rawConfig = JSON.stringify(_config);
    const rawOptions = JSON.stringify(_options);

    const args = [];

    if (nodeOptions && nodeOptions.length) {
      args.push(...nodeOptions);
    }
    args.push(runnerPath, rawConfig, rawOptions);
    log('args:', args);

    const env = { ...process.env };
    if (_config.tsconfig) { env.TS_NODE_PROJECT = _config.tsconfig; };
    // log('env:', env);

    const eventNames = qaReporter && qaReporter.eventNames();
    if (qaReporter) {
      log('qaReporter events:', eventNames);
      if (reporter) {
        console.warn('qaReporter will replace frameworkOptions.reporter');
      }
    } else {
      log('no qaReporter');
      if (reporter) {
        return reject(new Error('frameworkOptions.reporter is not allowed on exec mode'));
      }
    }

    const proc = spawn('node', args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'], env,
    });

    proc.on('message', (message: Serializable, sendHandle: SendHandle) => {
      if (eventNames) {
        const { type } = message as ReportMessage;
        if (eventNames.length === 0 || eventNames.indexOf(type) >= 0) {
          qaReporter.report(type, message as ReportMessage);
          // reporter.emit(type, type, message);
        }
      } else {
        console.log(message);
      }
    });

    proc.on('exit', (code, signal) => {
      log('child process is exit, keepMainProcess =', !!options.keepMainProcess);
      if (!options.keepMainProcess) {
        process.on('exit', () => {
          if (signal) {
            process.kill(process.pid, signal);
          } else {
            process.exit(code || 0);
          }
        });
      }
      resolve(code || 0);
    });

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
  });
}
