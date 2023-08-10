import path from "node:path";

import {
  loadUserConfig, setupConfig, buildProjects,
} from "./utils/index.js";
import { runProject } from "./runner/index.js";

export type CLIOptions = {
  config: string;
  project: string;
};

export async function run(options: CLIOptions, baseDir: string) {
  const configFile = path.isAbsolute(options.config)
    ? options.config
    : path.join(baseDir, options.config);

  const userConfig = await loadUserConfig(baseDir, configFile);
  const configDir = path.dirname(configFile);
  const config = setupConfig(userConfig, configDir);

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
