import {
  loadConfig, prepareSpecs,
} from "./utils/index.js";
import { runQArify } from "./runner/index.js";
import { execQArify } from "./nodejs/index.js";
import type { CLIOptions } from "./types.js";
import { ConsoleReporter } from './utils/console-reporter.js';
import { LogLevel, getLogger, setLogLevel } from './logger/logger.js';

const log = getLogger('run');
const err = getLogger('run', 'error');

export async function qarify(options: CLIOptions, baseDir: string) {
  if (options.logLevel) {
    setLogLevel(LogLevel[options.logLevel], true);
  } else {
    setLogLevel(LogLevel.info, true);
  }
  log('options:', options);

  const config = await loadConfig(baseDir, options);

  try {
    // prepare files
    log('prepare files with forceBuild =', config.forceBuild);
    const files = await prepareSpecs(config);

    if (config.nodeOptions && config.nodeOptions.length) {
      log('run child-process');
      // run child-process
      await execQArify(files, config, { execReporter: new ConsoleReporter() });
    }
    else {
      log('run in-process');
      // run in-process
      await runQArify(files, config);
    }
  } catch (e) {
    err(e);
    process.exit(1);
  }
}
