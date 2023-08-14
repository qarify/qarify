import path from "path";
import { execa } from "execa";

import type { QAConfig } from "../types.js";
import { setupProjects } from "./setup-config.js";
import { findAllFiles, mapFilesInConfig } from "./path-helpers.js";

export async function buildSpecs(config: QAConfig) {
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

export async function buildProjects(config: QAConfig, filter: string) {
  const projects = setupProjects(config, filter);
  if (projects.length <= 0) {
    throw new Error("No projects");
  }
  const outDir = await buildSpecs(config);
  if (!outDir) {
    throw new Error("Build failed");
  }
  // map spec files in config to build output
  const outFiles = findAllFiles(outDir);
  mapFilesInConfig(projects, outFiles);

  return projects;
}
