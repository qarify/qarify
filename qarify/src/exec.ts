import {SendHandle, Serializable, spawn} from 'child_process';
import path from 'path';
import url from 'url';
import debug from 'debug';

import { updateConfigWithRunOptions } from './utils/helpers.js';

import type { QAConfig, QARunnerOptions } from "./types.js";
import _dirname from './dirname/index.js';

const log = debug('qarify:exec');

export async function execQA(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions = {},
  parallel = false,
) {
  const dirname = await _dirname();
  const runnerPath = path.resolve(dirname, './runner/run-exec.js');
  const { nodeOptions, ..._config } = config; //updateConfigWithRunOptions(config, files, options);
  const rawConfig = JSON.stringify({ ..._config, specs: files });
  const rawOptions = JSON.stringify({ ...options, isForked: true });

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

  proc.on('message', (message: Serializable, sendHandle: SendHandle) => {
    console.log(message);
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
