/// <reference path="../types.d.ts" />

import path from "node:path";

import type { CLIOptions } from "./_types";
import {
  loadUserConfig, setupConfig, setupProjects, findAllFiles, mapFilesInConfig, buildSpecs,
} from "./utils/index.js";
import { runProject } from "./runner/index.js";

export async function run(options: CLIOptions, baseDir: string) {
  const configFile = path.isAbsolute(options.config)
    ? options.config
    : path.join(baseDir, options.config);

  const userConfig = await loadUserConfig(baseDir, configFile);
  const configDir = path.dirname(configFile);
  const config = setupConfig(userConfig, configDir);
  const projects = setupProjects(config, options.project);

  // no projects
  if (!projects || projects.length === 0) {
    console.error("No projects", options.project);
    process.exit(1);
  }

  // build
  console.log(">>> Build...");
  const outDir = await buildSpecs(config);
  // build error
  if (!outDir) {
    console.error("Build failed");
    process.exit(1);
  }
  console.log(">>> Build done.");

  // map spec files in config to build output
  const outFiles = findAllFiles(outDir);
  mapFilesInConfig(projects, outFiles);

  // run
  console.log(">>> Run projects");
  const promises = projects.map((e) => runProject(e, config));
  await Promise.all(promises);
  console.log(">>> Run done.");
}
