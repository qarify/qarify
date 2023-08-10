/// <reference path="../types.d.ts" />

import path from "node:path";
import { execa } from "execa";

// import type { QAConfig, QAProject } from "../types";
import type { CLIOptions } from "./_types";
import { loadUserConfig, findAllFiles, mapFilesInConfig } from "./utils/index.js";
import { runProject } from "./runner/run-project.js";
import { SpecRunnerFramework } from "./constants";

const defaultConfig: Partial<QAConfig> = {
  cacheDir: ".qacache",
  tsconfig: "tsconfig.json",
  framework: SpecRunnerFramework.mocha_qunit,
  options: {
    mochaOptions: {},
    waitforTimeout: 5000,
    waitforInterval: 1000,
  },
};

const defaultProject: Partial<QAProject> = {
};

export async function run(options: CLIOptions, baseDir: string) {
  const configFile = path.isAbsolute(options.config)
    ? options.config
    : path.join(baseDir, options.config);

  const userConfig = await loadUserConfig(baseDir, configFile);
  const config = Object.assign({}, defaultConfig, userConfig) as QAConfig;
  const configDir = path.dirname(configFile);
  const projects = config.projects
    .filter((e) => options.project === "*" || e.name === options.project)
    .map((e) => Object.assign({}, defaultProject, { options: config.options, ...e }) as Required<QAProject>);

  // no projects
  if (!projects || projects.length === 0) {
    console.error("No projects", options.project);
    process.exit(1);
  }

  if (!config.rootDir) {
    config.rootDir = configDir;
  }
  if (!path.isAbsolute(config.rootDir)) {
    config.rootDir = path.join(configDir, config.rootDir);
  }
  if (!path.isAbsolute(config.cacheDir)) {
    config.cacheDir = path.join(configDir, config.cacheDir);
  }
  if (!path.isAbsolute(config.tsconfig!)) {
    config.tsconfig = path.join(configDir, config.tsconfig!);
  }

  // build
  console.log(">>> Build...");
  const outDir = path.join(config.cacheDir, "out");
  const buildRes = await execa(
    "npx",
    ["tsc", "-p", config.tsconfig!, "--outDir", outDir],
    {
      stdio: "inherit",
    }
  );
  // build error
  if (buildRes.exitCode !== 0) {
    console.error("Build failed", buildRes);
    process.exit(buildRes.exitCode);
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
