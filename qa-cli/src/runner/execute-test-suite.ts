import EventEmitter from 'events';
import Mocha from 'mocha'
import url from 'node:url'

import mochaFactory, {
  type MochaError, type FormattedMessage
} from '@wdio/mocha-framework';

// import type { QATestSuite, QAConfig } from "../../types";
import { SpecRunnerEvent } from '../constants.js';
const FILE_PROTOCOL = 'file://'

class Reporter extends EventEmitter {
  constructor() {
    super();
    this.reportHandler = this.reportHandler.bind(this);
    [
      SpecRunnerEvent.suite_start,
      SpecRunnerEvent.suite_end,
      SpecRunnerEvent.hook_start,
      SpecRunnerEvent.hook_end,
      SpecRunnerEvent.test_end,
      SpecRunnerEvent.test_fail,
      SpecRunnerEvent.test_pass,
      SpecRunnerEvent.test_pending,
      SpecRunnerEvent.test_retry,
      SpecRunnerEvent.test_start
    ].forEach((e) => this.on(e, this.reportHandler));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   * @param msg 
   */
  reportHandler(msg: FormattedMessage) {
    const payload = { event: msg.type as SpecRunnerEvent, ...msg };
    // console.log('>>> PAYLOAD:', payload);
    if (msg.type === SpecRunnerEvent.test_fail) {
      //console.log(payload);
      if (msg.error) {
        console.error(msg.error.message);
        console.error(msg.error.stack);
      }
    }
  }
}

export async function executeTestSuite(testSuite: QATestSuite, project: Required<QAProject>, config: QAConfig, runnerId: string) {
  const { framework } = config;
  const { mochaOptions } = project.options;
  const _reporter = new Reporter();
  const { specs } = testSuite;

  const mocha = new Mocha({ ...mochaOptions, ui: framework.split(' ')[1].toLowerCase() })
  mocha.fullTrace()

  specs.forEach((spec) => mocha.addFile(
    spec.startsWith(FILE_PROTOCOL)
        ? url.fileURLToPath(spec)
        : spec
  ));

  // TODO
  // mocha.reporter(_reporter);

  try {
    await mocha.loadFilesAsync()
  } catch (err) {
    console.error(err);
    throw err;
  }

  let runtimeError
  const result = await new Promise((resolve) => {
    let _runner;
    try {
      _runner = mocha.run(resolve)
    } catch (err: any) {
      runtimeError = err
      return resolve(1)
    }
  });

  if (runtimeError) {
    throw runtimeError;
  }

  return result;

  // const adapter = await mochaFactory.init!(
  //   runnerId, // cid
  //   {
  //     // beforeTest: (test: any) => log.info('beforeTest', test.title),
  //     // beforeHook: () => log.info('beforeHook'),
  //     // afterTest: () => log.info('afterTest'),
  //     // afterHook: () => log.info('afterHook'),
  //     mochaOpts: {
  //       ...mochaOptions,
  //       ui: framework.split(' ')[1].toLowerCase(), // tdd or bdd
  //     }
  //   }, // config
  //   specs, // specs
  //   {}, // capability 
  //   _reporter // reporter
  // );
  // const failedCount = await adapter.run();
  // //
  // // dispose mocha 
  // // adapter.dispose();
  // return failedCount;
}