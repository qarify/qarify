import fs from "node:fs";
import path from "node:path";
import { execa } from "execa";
import type { QAConfig, QAProject, QATestSuite } from "./types";
import type { CLIOptions } from "./main";
import { executeTestSuite } from "./execute-test-suite.js";

const defaultConfig: Partial<QAConfig> = {
  cacheDir: ".qacache",
  tsconfig: "tsconfig.json",
};

export async function run(options: CLIOptions, baseDir: string) {
  const configFile = path.isAbsolute(options.config)
    ? options.config
    : path.join(baseDir, options.config);
  const userConfig = (
    await import(path.resolve(configFile), { assert: { type: "json" } })
  ).default as QAConfig;

  const projects =
    options.project === "*"
      ? userConfig.projects
      : userConfig.projects.filter((e) => e.name === options.project);
  if (!projects || projects.length === 0) {
    console.error("No projects", options.project);
    process.exit(1);
  }

  const config = Object.assign({}, defaultConfig, userConfig) as QAConfig;
  const configDir = path.dirname(configFile);
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
  console.log(">>> build...");
  const outDir = path.join(config.cacheDir, "out");
  const buildRes = await execa("npx", ["tsc", "-p", config.tsconfig!, "--outDir", outDir], {
    stdio: "inherit",
  });
  if (buildRes.exitCode !== 0) {
    console.error('Build failed', buildRes);
    process.exit(buildRes.exitCode);
  }
  console.log(">>> build done.");
  const outFiles = findAllFiles(outDir);
  // map config files to build output
  mapFilesInConfig(projects, config, outFiles);

  // execute
  console.log(">>> execute QA Specs");
  const tests = projects.reduce((acc, e) => {
    return acc.concat(e.testSuites);
  }, [] as QATestSuite[]);
  const promises = tests.map((e) => executeTestSuite(e, config, e.name));
  await Promise.all(promises);
  console.log(">>> execute done.");
}

function mapFilesInConfig(projects: QAProject[], config: QAConfig, outFiles: string[]) {
  for (const project of projects) {
    for (const suite of project.testSuites) {
      const files = [];
      for (const spec of suite.specs) {
        const file = findFilePath(spec, outFiles);
        if (!file) {
          throw new Error('Not found file: ' + suite);
        }
        files.push(file);
      }
      suite.specs = files;
    }
  }
}

function findFilePath(file: string, files: string[]) {
  const arr = replaceExtension(file).split('/');
  let pos = arr.length - 1;
  do {
    const file = files.filter((e) => e.endsWith(arr.slice(pos).join('/')));
    if (file.length === 1) {
      return file[0];
    }
  } while (pos-- > 0);
  return null;
}

function replaceExtension(fileName: string) {
  const extensions = [".ts", ".js", ".mts", ".mjs", ".cts", ".cjs", ".tsx", ".jsx"];
  let i = 0;
  do {
    if (fileName.endsWith(extensions[i])) {
      return fileName.replace(extensions[i], extensions[i+1]);
    }
    i += 2;
  } while (i < extensions.length);
  return fileName;
}

function findAllFiles(dir: string, files?: string[]) {
  if (!files) {
    files = [];
  }
  fs.readdirSync(dir, { withFileTypes: true}).forEach((dirent) => {
    if (dirent.isDirectory()) {
      findAllFiles(path.join(dir, dirent.name), files);
    }
    else {
      files?.push(path.join(dir, dirent.name));
    }
  });
  return files;
}

function isTS(fileName: string) {
  const extensions = ['.ts', '.tsx', '.mts', '.cts'];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return true;
    }
  }
  return false;
}
