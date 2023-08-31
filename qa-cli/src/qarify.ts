import type { CLIOptions, QArifyResult } from "@qarify/types";
import { getLogger, isSilent } from '@qarify/logger';
import {
  loadConfig, prepareSpecs, runQArify, execQArify, applyInitialCLIOptions
} from "qarify";

const log = getLogger('run');

export async function qarify(options: CLIOptions, baseDir: string) {
  // apply cli options
  applyInitialCLIOptions(options);

  const config = await loadConfig(baseDir, options);
  let res: QArifyResult[];

  try {
    log('prepare files with forceBuild =', !!config.forceBuild);
    const files = await prepareSpecs(config);

    if (options.forceFork || (config.nodeOptions && config.nodeOptions.length)) {
      log('run child-process');
      res = await execQArify(files, config, undefined, options);
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
