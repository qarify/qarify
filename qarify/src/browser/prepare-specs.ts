import type { QAConfig } from "@qarify/types";

export async function prepareSpecs(config: QAConfig) {
  return config.specs;
}
