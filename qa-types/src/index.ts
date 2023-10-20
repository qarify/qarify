
export enum LogLevel {
  debug = 1,
  info,
  error,
  silent,
}

// See https://mochajs.org/#interfaces
export enum SpecRunnerFramework {
  mocha_bdd = 'mocha-bdd',
  mocha_tdd = 'mocha-tdd',
  mocha_qunit = 'mocha-qunit',
  mocha_export = 'mocha-exports',
  js_eval = 'normal-script',
}

export enum SpecRunnerEvent {
  run_start = 'run:start',
  run_end = 'run:end',

  suite_start = 'suite:start',
  suite_end = 'suite:end',

  hook_start = 'hook:start',
  hook_end = 'hook:end',

  test_start = 'test:start',
  test_pass = 'test:pass',
  test_fail = 'test:fail',
  test_retry = 'test:retry',
  test_pending = 'test:pending',
  test_end = 'test:end',
  test_attach = 'test:attach',
};

export enum FindStrategy {
  XPath = 'xpath',
  // AccessibilityId = 'axId',
  AccessibilityId = 'accessibility id',
  Id = 'id',
  Name = 'name',
  ClassName = 'class name',
  AndroidUIAutomator = '-android uiautomator',
  AndroidDataMatcher = '-android datamatcher',
  AndroidViewTag = '-android viewtag',
  IosUIAutomation = '-ios predicate string',
  IosClassChain = '-ios class chain',
}
