import type { CLIOptions, QAConfig, QARunnerOptions, QArifyResult, ReportMessage } from "@qarify/types";

export async function execQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions,
  cliOptions: CLIOptions = {},
  execFileName = './browser/run-qarify.js', // <== based src root directory
) {
  return new Promise<QArifyResult[]>(async (resolve, reject) => {
    const result: QArifyResult[] = [];

    resolve(result);
  });
}
