import type { QAConfig, QArifyResult, QARunnerOptions } from "@qarify/types";

import { runQARunner } from "./runner.js";
import { updateConfigWithRunnerOptions } from '../utils/helpers.js';

export async function runQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions,
): Promise<QArifyResult[]> {
  return runQARunner(updateConfigWithRunnerOptions(config, files, options));
}
