import type { CLIOptions, QAConfig } from "@qarify/types";
import { SpecRunnerFramework } from "@qarify/types";

export async function loadConfig(
  baseDir: string,
  options?: CLIOptions,
): Promise<QAConfig> {
  let { config: configFile, ..._options } = options || {} as CLIOptions;
  let userConfig = {..._options} as QAConfig;

  return userConfig;
}

export async function loadConfigByPath(configPath: string) {
  return loadConfig(configPath);
}