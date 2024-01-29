import { getLogger, isSilent } from '@qarify/logger';

import { runQArify } from '../runner/run-qarify.js';
import { applyInitialCLIOptions } from "../utils/helpers.js";

/** @typedef {import('@qarify/types').QAConfig} QAConfig */
/** @typedef {import('@qarify/types').QARunnerOptions} QARunnerOptions */
/** @typedef {import('@qarify/types').CLIOptions} CLIOptions */

const log = getLogger('nodejs:run-qarify');

(async (args = []) => {
  if (!args || !args.length) {
    console.error('[nodejs:run-qarify]: args is null');
    // we are in a child-process
    process.exit(1);
  }

  /** @type {QAConfig} */
  const config = JSON.parse(args[0]);
  /** @type {QARunnerOptions} */
  const options = args.length > 1 ? JSON.parse(args[1]) : { runnerId: 'QArify' };
  // apply cli options
  /** @type {CLIOptions} */
  const cliOptions = args.length > 2 ? JSON.parse(args[2]) : {};
  applyInitialCLIOptions(cliOptions);

  // log after applying cli options
  log('args:', args);

  try {
    await runQArify(config.specs, config, options);
  } catch (e) {
    if (!isSilent()) {console.error(e);}
    process.exit(1);
  }
})(process.argv.slice(2));
