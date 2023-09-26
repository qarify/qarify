import type { MochaOptions, Runner, } from "mocha";
import { reporters } from "mocha";
import type { QARunnerReporter, QATestAttach, ReportMessage } from "@qarify/types";
import { SpecRunnerEvent } from "@qarify/types";
import { getLogger } from '@qarify/logger';

import { printMessage } from "../utils/helpers.js";

const Base = reporters ? reporters.Base : Mocha.reporters.Base;
const log = getLogger('runner:reporter');

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
// } = Runner.constants;

/**
 * map mocha events to SpecRunnerEvent
 */
export const MochaEventMap = {
  'start': SpecRunnerEvent.run_start,
  'end': SpecRunnerEvent.run_end,
  'suite': SpecRunnerEvent.suite_start,
  'suite end': SpecRunnerEvent.suite_end,
  'test': SpecRunnerEvent.test_start,
  'test end': SpecRunnerEvent.test_end,
  'hook': SpecRunnerEvent.hook_start,
  'hook end': SpecRunnerEvent.hook_end,
  'pass': SpecRunnerEvent.test_pass,
  'fail': SpecRunnerEvent.test_fail,
  'retry': SpecRunnerEvent.test_retry,
  'pending': SpecRunnerEvent.test_pending,
  [SpecRunnerEvent.test_attach]: SpecRunnerEvent.test_attach,
} as const;

export class TestReporter extends Base {
  private runnerId: string;
  private isForked: boolean;
  private qaReporter?: QARunnerReporter;
  private qaReporterMessages?: string[];
  private attached: QATestAttach[] = [];
  constructor(runner: Runner, options?: MochaOptions) {
    super(runner, options);
    const reporterOptions = (options && options.reporterOptions) || {};
    log('reporter options:', reporterOptions);

    this.runnerId = reporterOptions.runnerId || `${Date.now()}`;
    this.isForked = !!reporterOptions.isForked;
    this.qaReporter = reporterOptions.qaReporter;
    if (this.qaReporter) {
      this.qaReporterMessages = this.qaReporter.eventNames() as string[];
      log('qaReporterMessages:', this.qaReporterMessages);
    }

    this.report = this.report.bind(this);
    // listen runner events
    (
      Object.keys(MochaEventMap) as Array<keyof typeof MochaEventMap>
    ).forEach((e) => runner.on(e, this.report.bind(this, MochaEventMap[e])));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   */
  report(type: SpecRunnerEvent, payload: any, err?: Error, params?: any) {
    if (type === SpecRunnerEvent.test_attach && params) {
      this.attached.push(...params as Array<QATestAttach>);
      return;
    }

    const message = formatReportMessage(type, payload, err, params);
    message.runnerId = this.runnerId;
    message.stats = { passed: this.stats.passes, failed: this.stats.failures };
    if (this.attached.length) { message.attached = [...this.attached]; }

    if (this.isForked) {
      process.send && process.send(message);
    } else if (this.qaReporter && this.qaReporterMessages) {
      if (this.qaReporterMessages.length === 0 || this.qaReporterMessages.indexOf(type) >= 0) {
        this.qaReporter.emit(type, message);
      }
    } else {
      printMessage(type, message);
    }

    if (type === SpecRunnerEvent.test_end && this.attached.length) {
      // reset attach
      this.attached.length = 0;
    }
  }
}

export function formatReportMessage(type: SpecRunnerEvent, payload: any, err?: Error, params?: any) {
  const message = {
    type,
  } as ReportMessage;

  if (payload) {
    // title
    message.titles = [];
    let parent = payload;
    while (parent) {
      message.titles.push(parent.title);
      parent = parent.parent;
    }
    message.title = message.titles[0];
    // file
    let ctx;
    parent = payload;
    while (parent) {
      if (parent.file) {
        message.file = parent.file;
        break;
      }
      ctx = parent.ctx;
      if (ctx && ctx.currentTest && ctx.currentTest.file) {
        message.file = ctx.currentTest.file;
        break;
      }
      parent = parent.parent;
    }
    // duration
    if (payload.duration) {
      message.duration = payload.duration;
    }
  }

  if (params) {
    if (type === SpecRunnerEvent.test_attach) {
      message.attached = params;
    }
  }

  if (err) {
    message.error = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return message;
}
