import EventEmitter from 'events';
import mochaFactory, {
  type MochaError, type FormattedMessage
} from '@wdio/mocha-framework';
import type { QAConfig, QATestSuite } from "./types";

export const enum CodeRunnerEvent {
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

class Reporter extends EventEmitter {
  constructor() {
    super();
    this.reportHandler = this.reportHandler.bind(this);
    [
      CodeRunnerEvent.suite_start,
      CodeRunnerEvent.suite_end,
      CodeRunnerEvent.hook_start,
      CodeRunnerEvent.hook_end,
      CodeRunnerEvent.test_end,
      CodeRunnerEvent.test_fail,
      CodeRunnerEvent.test_pass,
      CodeRunnerEvent.test_pending,
      CodeRunnerEvent.test_retry,
      CodeRunnerEvent.test_start
    ].forEach((e) => this.on(e, this.reportHandler));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   * @param msg 
   */
  reportHandler(msg: FormattedMessage) {
    const payload = { event: msg.type as CodeRunnerEvent, ...msg };
    // console.log('>>> PAYLOAD:', payload);
    if (msg.type === CodeRunnerEvent.test_fail) {
      //console.log(payload);
      if (msg.error) {
        console.error(msg.error.message);
        console.error(msg.error.stack);
      }
    }
  }
}

export async function executeTestSuite(testSuite: QATestSuite, config: QAConfig, runnerId: string) {
  const { mochaOptions, framework } = config;
  const _reporter = new Reporter();
  const { specs } = testSuite;

  const adapter = await mochaFactory.init!(
    runnerId, // cid
    {
      // beforeTest: (test: any) => log.info('beforeTest', test.title),
      // beforeHook: () => log.info('beforeHook'),
      // afterTest: () => log.info('afterTest'),
      // afterHook: () => log.info('afterHook'),
      mochaOpts: {
        ...mochaOptions,
        ui: framework.split(' ')[1].toLowerCase(), // tdd or bdd
      }
    }, // config
    specs, // specs
    {}, // capability 
    _reporter // reporter
  );
  const failedCount = await adapter.run();
  //
  // dispose mocha 
  adapter.dispose();
  return failedCount;
}