import {
  loadConfig, prepareSpecs,
} from "./utils/index.js";
import { runQArify } from "./runner/index.js";
import { execQArify } from "./nodejs/index.js";
import type { CLIOptions, QArifyResult } from "./types.js";
// import { ConsoleReporter } from './utils/console-reporter.js';
import { LogLevel, getLogger, setLogLevel, isSilent } from './logger/logger.js';

const log = getLogger('run');

export async function qarify(options: CLIOptions, baseDir: string) {
  if (!process.env.DEBUG) {
    const level = options.ci ? 'silent' : (options.logLevel || 'error');
    setLogLevel(LogLevel[level], true);
  } else if (options.logLevel !== 'error') {
    console.warn('logLevel is ignored as process.env.DEBUG is set,', process.env.DEBUG);
  }

  const config = await loadConfig(baseDir, options);
  let res: QArifyResult[];

  try {
    log('prepare files with forceBuild =', config.forceBuild);
    const files = await prepareSpecs(config);

    if (options.forceFork || (config.nodeOptions && config.nodeOptions.length)) {
      log('run child-process');
      res = await execQArify(files, config);
      // await execQArify(files, config, { execReporter: new ConsoleReporter() });
    }
    else {
      log('run in-process');
      res = await runQArify(files, config);
    }
  } catch (e) {
    if (!isSilent()) {console.error(e);}
    process.exit(1);
  }
  if (res) {
    const failed = res.reduce((a, e) => a + e.failed, 0);
    if (!isSilent()) {console.log(failed ? `\nFailed ${failed} test(s).` : '\nDone.', res);}
    process.exit(failed);
  }
}
