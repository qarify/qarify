import path from "path";
import { execa } from "execa";

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
