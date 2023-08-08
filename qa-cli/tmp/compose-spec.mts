import fs from "node:fs";
import path from "node:path";
import { execa } from "execa";

import type { Task, Spec, QAConfig, QAProject, QATestCase } from "./types";
import type { CLIOptions } from "./main";
import { genESMSpecFile, genCJSSpecFile } from "./gen-spec-file.js";

const defaultConfig: Partial<QAConfig> = {
  specsDir: "qa",
  tasksDir: "qa",
  cacheDir: ".qacache",
  type: "module",
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
  if (!path.isAbsolute(config.specsDir)) {
    config.specsDir = path.join(configDir, config.specsDir);
  }
  if (!path.isAbsolute(config.tasksDir)) {
    config.tasksDir = path.join(configDir, config.tasksDir);
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

  // generate
  console.log(">>> compose QA Specs");
  const genDir = path.join(config.cacheDir, "gen");
  const promises = projects.map((e) => composeSpecs(e, config));
  await Promise.all(promises);
  console.log(">>> compose done.");

  // run
  const mocha = findModule('mocha', configDir);
  if (!mocha) {
    console.error('No mocha');
    process.exit(1);
  }
  await execa("node", [mocha, "--ui", "exports", `${genDir}/*.spec.js`], {
    stdio: "inherit",
  });
}

function composeSpecs(project: QAProject, config: QAConfig) {
  const { cacheDir, rootDir, type } = config;
  const { name, connection, testSuite } = project;

  const outDir = path.join(cacheDir, "out");
  const genDir = path.join(cacheDir, "gen");
  const isESM = type === "module";

  const { testCases } = testSuite;
  for (const tc of testCases) {
    console.log(">>> composing", name, '>', tc.name);
    const { preTasks, specs, postTasks } = tc;

    const _preTasks = preTasks.map((e: any) => ({
      ...e,
      path: findRelativePath(
        path.join(outDir, e.path).normalize(),
        genDir,
        isESM
      ),
    }));
    const _postTasks = postTasks.map((e: any) => ({
      ...e,
      path: findRelativePath(
        path.join(outDir, e.path).normalize(),
        genDir,
        isESM
      ),
    }));
    const _specs = specs.map((e: any) => ({
      ...e,
      path: findRelativePath(
        path.join(outDir, e.path).normalize(),
        genDir,
        isESM
      ),
    }));
    // console.log('>>> preTasksPaths:', preTasksPaths);
    if (isESM) {
      genESMSpecFile(
        path.join(genDir, `${testCaseName(tc)}.spec.js`),
        _preTasks,
        _specs,
        _postTasks,
        tc.name
      );
    } else {
      genCJSSpecFile(
        path.join(genDir, `${testCaseName(tc)}.spec.js`),
        _preTasks,
        _specs,
        _postTasks,
        tc.name
      );
    }
  }
}

function testCaseName(tc: QATestCase) {
  return tc.name.replaceAll(' ', '_');
}

function replaceExtension(fileName: string) {
  const extensions = [".js", ".ts", ".mjs", ".cjs", ".mts", ".cts"];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return fileName.replace(ext, ".js");
    }
  }
  return fileName;
}

function removeExtension(fileName: string) {
  const extensions = [".js", ".ts", ".mjs", ".cjs", ".mts", ".cts"];
  for (const ext of extensions) {
    if (fileName.endsWith(ext)) {
      return fileName.replace(ext, "");
    }
  }
  return fileName;
}

function findRelativePath(origin: string, newBase: string, isESM: boolean) {
  // //   console.log("origin:", origin, "base:", newBase);
  // const oarr = origin.split(path.sep);
  // const barr = newBase.split(path.sep);
  // //   console.log(">>> oarr:", oarr);
  // let count = 0;
  // while (count < barr.length && oarr[count] === barr[count]) {
  //   count++;
  // }
  // const dotCount = barr.length - count;
  // //   console.log(">>> dotCount:", dotCount);
  // const relPath =
  //   dotCount === 0 ? ["."] : Array.from({ length: dotCount }).map(() => "..");
  // while (count < oarr.length) {
  //   relPath.push(oarr[count++]);
  // }
  const relPath = origin.split(path.sep);
  return relPath.map(isESM ? replaceExtension : removeExtension).join("/");
}

function findModule(name: string, dir: string) {
  do {
    const mod = path.join(dir, 'node_modules', '.bin', name);
    if (fs.existsSync(mod)) {
      return mod;
    }
    dir = path.dirname(dir);

    // / => ['', '']
    // C:\\ => ['C:', '']
  } while (dir.split(path.sep)[1]);

  return null;
}