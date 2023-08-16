import path from "path";

import type { QAConfig, QAProject } from "../types.js";
import { SpecRunnerFramework } from "../constants.js";

const defaultProject: QAProject = {
  id: "default",
  name: "default",
};

const defaultConfig: QAConfig = {
  rootDir: "./qa",
  cacheDir: ".qycache",
  tsconfig: "./qa/tsconfig.json",
  project: [defaultProject],
  framework: SpecRunnerFramework.mocha_qunit,
  options: {
    waitforTimeout: 5000,
    waitforInterval: 1000,
  },
};

export function setupConfig(
  userConfig: Partial<QAConfig> | undefined,
  baseDir: string
) {
  const config = Object.assign({}, defaultConfig, userConfig) as QAConfig;

  if (!config.rootDir) {
    config.rootDir = baseDir;
  }
  if (!path.isAbsolute(config.rootDir)) {
    config.rootDir = path.join(baseDir, config.rootDir);
  }
  if (!path.isAbsolute(config.cacheDir)) {
    config.cacheDir = path.join(baseDir, config.cacheDir);
  }
  if (!path.isAbsolute(config.tsconfig!)) {
    config.tsconfig = path.join(baseDir, config.tsconfig!);
  }
  return config;
}

export function setupProjects(config: QAConfig, filter: string) {
  if (!Array.isArray(config.project)) {
    config.project = [config.project];
  }
  const project = config.project
    .filter((e) => filter === "*" || e.name === filter)
    .map(
      (e) =>
        Object.assign(
          {},
          { options: config.options, ...e }
        ) as Required<QAProject>
    );

  const baseDir = config.rootDir;
  project.forEach((p) => {
    p.testSuites.forEach((t) => {
      t.specFiles = t.specFiles.map((s) => path.isAbsolute(s) ? s : path.join(baseDir, s));
    });
  });

  return project;
}
