import debug from 'debug';

import {
  loadConfig, prepareSpecs,
} from "./utils/index.js";
import { runQArify } from "./runner/index.js";
import { execQArify } from "./nodejs/index.js";
import type { CLIOptions } from "./types.js";
// import { TestReporter } from './utils/reporter.js';

const log = debug('qarify:run');

export async function qarify(options: CLIOptions, baseDir: string) {
  const config = await loadConfig(baseDir, options);

  try {
    // prepare files
    log('prepare files with forceBuild =', config.forceBuild);
    const files = await prepareSpecs(config);

    if (config.nodeOptions && config.nodeOptions.length) {
      log('run child-process');
      // run child-process
      await execQArify(files, config);
    }
    else {
      log('run in-process');
      // const reporter = new TestReporter();

      // run in-process
      await runQArify(files, config);
      // await runQA(files, config, { reporter });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
