
import { QAConfig, QARunnerOptions } from '../types.js';
import { runQArify } from '../runner/run-qarify.js';
import debug from 'debug';
import { _DEBUG_QUARIFY } from '../constants.js';

const log = debug('qarify:nodejs:run-qarify');
if (_DEBUG_QUARIFY) {
  log.enabled = true;
}

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
