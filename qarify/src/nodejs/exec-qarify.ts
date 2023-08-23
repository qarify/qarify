import {SendHandle, Serializable, spawn} from 'child_process';
import path from 'path';
import debug from 'debug';

import type { QAConfig, QARunnerOptions, ReportMessage } from "../types.js";
import _dirname from '../dirname/index.js';

const log = debug('qarify:nodejs:exec-qarify');

export async function execQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions = {},
  parallel = false,
) {
  const dirname = await _dirname();
  const runnerPath = path.resolve(dirname, './nodejs/run-qarify.js');
  const { nodeOptions, ..._config } = config; 
  const { reporter, ..._options } = options;

  const rawConfig = JSON.stringify({ ..._config, specs: files });
  const rawOptions = JSON.stringify({ ..._options, isForked: true });

  const args = [];

  if (nodeOptions && nodeOptions.length) {
    args.push(...nodeOptions);
  }
  args.push(runnerPath, rawConfig, rawOptions);
  log('args:', args);

  const env = { ...process.env };
  if (_config.tsconfig) { env.TS_NODE_PROJECT = _config.tsconfig; };
  log('env:', env);

  const proc = spawn('node', args, {
    stdio: 'inherit', env,
  });

  reporter && reporter.setOptions(_config.mochaOptions);
  const eventNames = reporter && reporter.eventNames();
  proc.on('message', (message: Serializable, sendHandle: SendHandle) => {
    if (eventNames) {
      const { type } = message as ReportMessage;
      if (eventNames.indexOf(type) >= 0) {
        reporter.emit(type, message);
      }
    } else {
      console.log(message);
    }
  });

  proc.on('exit', (code, signal) => {
    process.on('exit', () => {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code || 0);
      }
    });
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
}
