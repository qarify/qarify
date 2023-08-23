// import Mocha from 'mocha'

export const _DEBUG_QUARIFY = false;

// const {
//  EVENT_RUN_BEGIN,
//  EVENT_RUN_END,
// 	EVENT_HOOK_BEGIN,
// 	EVENT_HOOK_END,
//  EVENT_SUITE_BEGIN,
// 	EVENT_SUITE_END,
//  EVENT_TEST_BEGIN,
// 	EVENT_TEST_FAIL,
//  EVENT_TEST_PASS,
// 	EVENT_TEST_PENDING,
//  EVENT_TEST_RETRY,
// 	EVENT_TEST_END,
// } = Mocha.Runner.constants;

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
};
