import fs from 'fs';
import path from "path";
import type { QAConfig } from "@qarify/types";

import { findAllFiles, mapFilesInConfig } from "../utils/path-helpers.js";
import { findSpecFiles } from './find-spec-files.js';
import { execAsync } from './exec-async.js';

const _defaultTsConfig = './qa/tsconfig.json';

async function _execBuild(config: QAConfig) {
  const outDir = path.join(config.cacheDir, "out");
  const args = ['tsc'];
  args.push('-p', config.tsconfig!);
  args.push('--outDir', outDir, '--noEmit', 'false');
  const exitCode = await execAsync(
    "npx",
    args,
    {
      stdio: "inherit",
    }
  ).catch(e => e);
  if (exitCode !== 0) {
    return null;
  }
  return outDir;
}

async function buildSpecs(config: QAConfig) {
  const files = findSpecFiles(config.specs, config.rootDir);
  if (files.length <= 0) {
    throw new Error("No spec files");
  }
  if (!config.tsconfig) {
    config.tsconfig = path.join(config.rootDir, _defaultTsConfig);
  }
  if (!fs.existsSync(config.tsconfig)) {
    throw new Error('no tsconfig file specified for build files');
  }
  const outDir = await _execBuild(config);
  if (!outDir) {
    throw new Error("Build failed");
  }
  // map spec files in config to build output
  const outFiles = findAllFiles(outDir);
  const mappedFiles = mapFilesInConfig(files, outFiles);

  return mappedFiles;
}

export async function prepareSpecs(config: QAConfig) {
  if (config.forceBuild) {
    return buildSpecs(config);
  } else {
    return findSpecFiles(config.specs, config.rootDir);
  }
}
