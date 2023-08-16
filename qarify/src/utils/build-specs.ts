import path from "path";
import { execa } from "execa";

import type { QAConfig } from "../types.js";
import { findAllFiles, findSpecFiles, mapFilesInConfig } from "./path-helpers.js";

async function _buildSpecs(config: QAConfig) {
  const outDir = path.join(config.cacheDir, "out");
  const buildRes = await execa(
    "npx",
    ["tsc", "-p", config.tsconfig!, "--outDir", outDir],
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
  const files = findSpecFiles(config.specs);
  if (files.length <= 0) {
    throw new Error("No spec files");
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
