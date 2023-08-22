
import { QAConfig, QARunnerOptions } from '../types.js';
import { runQA } from './run.js';
import debug from 'debug';

const log = debug('qarify:runner:exec');

(async (args: string[] = []) => {
  if (!args || !args.length) {
    log('args is null');
    process.exit(1);
  }
  log('args:', args);

  const config: QAConfig = JSON.parse(args[0]);
  const options: QARunnerOptions = args.length > 1 ? JSON.parse(args[1]) : {};
  await runQA(config.specs, config, options);
})(process.argv.slice(2));
