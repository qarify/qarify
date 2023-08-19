import {
  loadConfig, buildSpecs,
} from "./utils/index.js";
import { runQA } from "./runner/index.js";
import type { CLIOptions } from "./types.js";

export async function run(options: CLIOptions, baseDir: string) {
  const config = await loadConfig(baseDir, options);

  try {
    let files = config.specs;
    // build
    if (config.forceBuild) {
      files = await buildSpecs(config);
    }

    // run
    if (config.tsconfig) {
      process.env.TS_NODE_PROJECT = config.tsconfig;
    }
    const res = await runQA(files, config);

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
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
