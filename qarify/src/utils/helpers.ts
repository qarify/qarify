import type { QAConfig, QADriver, QAFrameworkOption, QAReporterOptions, QARunnerOptions } from "../types.js";

export function updateConfigWithRunOptions(
  config: QAConfig,
  files?: string[],
  options: QARunnerOptions = {},
): QAConfig {
  const { drivers: driverOption } = options;
  const { drivers, specs, frameworkOptions: mochaOptions = {} } = config;
  
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

  return {
    ...config,
    drivers: _drivers,
    specs: files,
  };
}

export function updateExecConfig(
  config: QAConfig,
  files?: string[],
  options?: QARunnerOptions,
) {
  const { nodeOptions, specs, ..._config } = config;
  const frameworkOptions = config.frameworkOptions || {} as QAFrameworkOption;
  const { reporter, reporterOptions, ..._frameworkOptions } = frameworkOptions;
  const { qaReporter, ..._reporterOptions } = reporterOptions || {};
  const { execReporter, ..._options } = options || {};

  _reporterOptions.isForked = true;

  if (!files) { files = specs; }

  return {
    config: {
      ..._config,
      specs: files,
      frameworkOptions: {
        ..._frameworkOptions,
        reporter: typeof reporter === 'string' ? reporter : undefined,
        reporterOptions: _reporterOptions,
      },
    },
    nodeOptions,
    reporter: typeof reporter !== 'string' ? reporter : undefined,
    qaReporter: execReporter || qaReporter,
    options: _options,
  };
}