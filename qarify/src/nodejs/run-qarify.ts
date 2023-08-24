
import type { CLIOptions, QAConfig, QARunnerOptions } from '../types.js';
import { runQArify } from '../runner/run-qarify.js';
import { getLogger, isSilent } from '../logger/logger.js';
import { applyInitialCLIOptions } from "../utils/helpers.js";

const log = getLogger('nodejs:run-qarify');

(async (args: string[] = []) => {
  if (!args || !args.length) {
    console.error('[nodejs:run-qarify]: args is null');
    // we are in a child-process
    process.exit(1);
  }

  const config: QAConfig = JSON.parse(args[0]);
  const options: QARunnerOptions = args.length > 1 ? JSON.parse(args[1]) : {};
  // apply cli options
  const cliOptions: CLIOptions = args.length > 2 ? JSON.parse(args[2]) : {};
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
