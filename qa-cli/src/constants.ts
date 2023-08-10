export const enum SpecRunnerFramework {
  mocha_bdd = 'Mocha BDD',
  mocha_tdd = 'Mocha TDD',
  mocha_qunit = 'Mocha QUnit',
  mocha_export = 'Mocha Exports',
  js_eval = 'Normal Script',
}

export const enum SpecRunnerEvent {
  suite_start = 'suite:start',
  suite_end = 'suite:end',
  test_start = 'test:start',
  test_end = 'test:end',
  hook_start = 'hook:start',
  hook_end = 'hook:end',
  test_pass = 'test:pass',
  test_fail = 'test:fail',
  test_retry = 'test:retry',
  test_pending = 'test:pending',
};
