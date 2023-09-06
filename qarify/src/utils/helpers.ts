import type {
  CLIOptions, QAConfig, QARunner, QADriver, QAFrameworkOption, QARunnerOptions, ReportMessage, QATestAttach
} from "@qarify/types";
import { SpecRunnerEvent, LogLevel } from "@qarify/types";
import { setLogLevel, isSilent } from '@qarify/logger';

import { isNode } from "./platform.js";
import { getQARunner } from "../runner/runner.js";

import { MAX_SUPPORT_VERSION, MIN_SUPPORT_VERSION } from "../constants.js";

export function updateConfigWithRunnerOptions(
  config: QAConfig,
  files: string[],
  options: QARunnerOptions,
): QARunner {
  const { drivers: driverOption, runnerId } = options;
  const { drivers } = config;
  
  // apply driverOption
  let _drivers: QADriver[] = [];

  if (driverOption && driverOption.length) {
    if (drivers && drivers.length) {
      _drivers.push(...drivers.filter((e) => driverOption.find((n) => n === e.name)));
    }
  } else {
    if (drivers && drivers.length) {
      _drivers = drivers;
    } else {
      // add empty driver
      _drivers.push({ name: 'no or existing' } as QADriver);
    }
  }

  return {
    ...config,
    runnerId,
    drivers: _drivers,
    specs: files || config.specs,
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

export function printMessage(type: SpecRunnerEvent, message: ReportMessage) {
  if (isSilent()) {
    return;
  }

  if (type === SpecRunnerEvent.test_pass) {
    console.log(message);
  } else if (type === SpecRunnerEvent.test_fail) {
    const { error, ..._message } = message;
    console.error(_message);
    if (error) {
      error.stack ? console.error(error.stack) : console.error(error.message);
    }
  } else {
    // console.log(message);
  }
}

export function applyInitialCLIOptions(options: CLIOptions) {
  let applyLogLevel = false;
  if (isNode()) {
    applyLogLevel = !process.env.DEBUG;
  }
  if (applyLogLevel) {
    const level = options.ci ? 'silent' : (options.logLevel || 'error');
    setLogLevel(LogLevel[level], true);
  } else if (options.logLevel !== 'error') {
    console.warn('logLevel is ignored as process.env.DEBUG is set,', process.env.DEBUG);
  }
}

export function configVersionToNumber(ver: string) {
  const v = ver.split('.');

  // invalid length
  if (v.length !== 2) { return -1; }

  // invalid value
  if (!v[0] || !v[1]) { return -2; }
  const v1 = Number.parseInt(v[0], 10);
  const v2 = Number.parseInt(v[1], 10)
  if (!Number.isInteger(v1) || !Number.isInteger(v2)) { return -2; }
  if (v2 > 9999) { return -2; }

  return v1 * 10000 + v2;
}

export function isValidConfigVersion(ver: string) {
  const v = configVersionToNumber(ver);
  if (v < 0) {
    throw new Error('invalid version');
  }
  if (v > MAX_SUPPORT_VERSION || v < MIN_SUPPORT_VERSION) {
    throw new Error('not supported version');
  }
  return v;
}

export function getCurrentTest(ctx: Mocha.Context): Mocha.Test | undefined {
  if (ctx) {
    if (ctx.currentTest) { return ctx.currentTest; }
    if (ctx.test) { return ctx.test as Mocha.Test; }
  }
  const runner = getQARunner();
  if (runner && runner.context && runner.context.instance) { return runner.context.instance.test; }
  return undefined;
}

function toValidFileName(str: string) {
  const invalidFileChars = [
    "#", "%", "&", "{", "}", "/", "\\", '"', "'", "<", ">", "?", "*", " ", "$", "!", ":", "@", "+", "`", "|", "="
  ];
  const valid = [];
  for (let i = 0; i < str.length; i ++) {
    if (invalidFileChars.indexOf(str[i]) >= 0) {
      valid.push('-');
    } else {
      valid.push(str[i]);
    }
  }
  return valid.join('');
}

export function getTestPrefix(ctx: Mocha.Context, dir = 1): string[] | undefined {
  let test: Mocha.Test | undefined = undefined;
  if (ctx) {
    if (ctx.currentTest) { test = ctx.currentTest; }
    else if (ctx.test) { test = ctx.test as Mocha.Test; }
  }
  const runner = getQARunner();
  if (!test && runner) {
    if (runner && runner.context && runner.context.instance) {
      test = runner.context.instance.test;
    } else {
      return undefined;
    }
  }
  if (runner && test) {
    if (dir === 1) {
      return [toValidFileName(runner.runnerId || 'no-runner-id'), toValidFileName(test.fullTitle() || `no-title-${Date.now()}`)];
    }
    return [toValidFileName(`${runner.runnerId}_${test.fullTitle()}`)];
  } else if (test) {
    return [toValidFileName(`${test.fullTitle()}`)];
  }
  return undefined;
}

export function sendAttachToReporter(test: Mocha.Test | undefined, attachment: QATestAttach[]) {
  const runner = getQARunner();
  if (!runner || !runner.context || !runner.context.instance) { return false; }

  if (!test) { test = runner.context.instance.test; }
  if (!test) { return false; }
  const _test = {
    title: test.title,
    parent: test.parent,
    file: test.file,
    duration: test.duration,
    speed: test.speed,
    state: test.state,
    type: SpecRunnerEvent.test_attach,
  };
  return runner.context.instance.emit(SpecRunnerEvent.test_attach, _test, undefined, attachment);
}