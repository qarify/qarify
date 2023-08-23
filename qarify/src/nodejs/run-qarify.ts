
import { QAConfig, QARunnerOptions } from '../types.js';
import { runQArify } from '../runner/run-qarify.js';
import { getLogger } from '../logger/logger.js';

const log = getLogger('nodejs:run-qarify');

(async (args: string[] = []) => {
  if (!args || !args.length) {
    log('args is null');
    process.exit(1);
  }
  log('args:', args);

  const config: QAConfig = JSON.parse(args[0]);
  const options: QARunnerOptions = args.length > 1 ? JSON.parse(args[1]) : {};
  await runQArify(config.specs, config, options);
})(process.argv.slice(2));
