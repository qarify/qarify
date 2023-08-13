import {
  loadUserConfig,
} from "./utils/path-helpers.js";
import {
  setupConfig, buildProjects,
} from "./utils/index.js";
import { runProject } from "./runner/index.js";

export type CLIOptions = {
  config?: string;
  project: string;
};

export async function run(options: CLIOptions, baseDir: string) {
  const userConfig = await loadUserConfig(baseDir, options.config);
  const config = setupConfig(userConfig, userConfig.rootDir!);

  try {
    // build
    const projects = await buildProjects(config, options.project);
    // run
    const promises = projects.map((e) => runProject(e, config));
    await Promise.all(promises);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
