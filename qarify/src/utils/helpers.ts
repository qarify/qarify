import type { QAConfig, QADriver, QARunnerOptions } from "../types.js";

export function updateConfigWithRunOptions(
  config: QAConfig,
  files?: string[],
  options: QARunnerOptions = {},
): QAConfig {
  const { drivers: driverOption, isForked } = options;
  const { drivers, specs, mochaOptions = {} } = config;
  
  // apply driverOption
  let _drivers: QADriver[] = [];
  if (!files) { files = specs; }

  if (driverOption && driverOption.length) {
    if (drivers && drivers.length) {
      _drivers.push(...drivers.filter((e) => driverOption.find((n) => n === e.name)));
    }
  } else {
    if (drivers && drivers.length) {
      _drivers = drivers;
    } else {
      // add empty driver
      _drivers.push({ name: '' } as QADriver);
    }
  }
  // apply isForked
  if (isForked) {
    // set reporterOptions
    if (!mochaOptions.reporterOptions) {
      mochaOptions.reporterOptions = {};
    }
    mochaOptions.reporterOptions.isForked = true;
    // unset reporter
    if (mochaOptions.reporter) {
      // use default reporter
      mochaOptions.reporter = undefined;
    }
  }

  return {
    ...config,
    drivers: _drivers,
    specs: files,
    ...(mochaOptions && Object.keys(mochaOptions).length ? { mochaOptions } : {}),
  };
}
