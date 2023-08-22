import debug from 'debug';

import {
  loadConfig, buildSpecs, findSpecFiles,
} from "./utils/index.js";
import { runQA, execQA } from "./runner/index.js";
import type { CLIOptions } from "./types.js";
// import { TestReporter } from './utils/reporter.js';

const log = debug('qarify:run');

export async function run(options: CLIOptions, baseDir: string) {
  const config = await loadConfig(baseDir, options);

  try {
    let files: string[];
    // build
    if (config.forceBuild) {
      files = await buildSpecs(config);
      log('built files:', files);
    } else {
      files = findSpecFiles(config.specs, config.rootDir);
      log('found files:', files);
    }

    if (config.nodeOptions && config.nodeOptions.length) {
      log('run child-process');
      // run child-process
      await execQA(files, config);
    }
    else {
      // const reporter = new TestReporter();

      log('run in-process');
      // run in-process
      const res = await runQA(files, config);
      // const res = await runQA(files, config, { reporter });

      // print result
      if (res.find((e) => e.failed !== 0)) {
        console.error('QArify Failed:', `${config.name} config`);
        console.error(res);
      } else {
        console.log('QArify Done:', `${config.name} config`);
        const ids = res.map((e) => e.runnerId).filter(Boolean);
        if (ids.length) {
          console.log('  Runner IDs:', ids);
        }
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
