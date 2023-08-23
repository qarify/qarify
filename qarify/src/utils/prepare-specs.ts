import fs from 'fs';
import path from "path";
import { execa } from "execa";

import type { QAConfig } from "../types.js";
import { findAllFiles, findSpecFiles, mapFilesInConfig } from "./path-helpers.js";

const _defaultTsConfig = './qa/tsconfig.json';

async function _buildSpecs(config: QAConfig) {
  const outDir = path.join(config.cacheDir, "out");
  const args = ['tsc'];
  args.push('-p', config.tsconfig!);
  args.push('--outDir', outDir, '--noEmit', 'false');
  const buildRes = await execa(
    "npx",
    args,
    {
      stdio: "inherit",
    }
  );
  if (buildRes.exitCode !== 0) {
    return null;
  }
  return outDir;
}

export async function buildSpecs(config: QAConfig) {
  const files = findSpecFiles(config.specs, config.rootDir);
  if (files.length <= 0) {
    throw new Error("No spec files");
  }
  if (!config.tsconfig) {
    config.tsconfig = path.join(config.rootDir, _defaultTsConfig);
  }
  if (!fs.existsSync(config.tsconfig)) {
    throw new Error('no tsconfig files specified for build files');
  }
  const outDir = await _buildSpecs(config);
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