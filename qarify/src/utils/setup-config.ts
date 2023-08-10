import path from "path";
import { SpecRunnerFramework } from "../constants";

const defaultConfig: Partial<QAConfig> = {
  cacheDir: ".qacache",
  tsconfig: "tsconfig.json",
  framework: SpecRunnerFramework.mocha_qunit,
  options: {
    waitforTimeout: 5000,
    waitforInterval: 1000,
  },
};

const defaultProject: Partial<QAProject> = {
};

export function setupConfig(userConfig: QAConfig | undefined, baseDir: string) {
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
  return config.projects
    .filter((e) => filter === "*" || e.name === filter)
    .map((e) => Object.assign({}, defaultProject, { options: config.options, ...e }) as Required<QAProject>);
}
