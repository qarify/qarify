import { MochaOptions, Runner, Stats, reporters } from "mocha";

import { SpecRunnerEvent } from "../constants.js";
import type { QARunnerReporter, ReportMessage } from "../types.js";
import { getLogger } from "../logger/logger.js";

const log = getLogger('runner:reporter');
const info = getLogger('report', 'info');

/**
 * map mocha events to SpecRunnerEvent
 */
export const MochaRunnerEvent = {
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
} as const;

export class TestReporter extends reporters.Base {
  private runnerId: string;
  private isForked: boolean;
  private qaReporter?: QARunnerReporter;
  private qaReporterMessages?: string[];

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
      Object.keys(MochaRunnerEvent) as Array<keyof typeof MochaRunnerEvent>
    ).forEach((e) => runner.on(e, this.report.bind(this, MochaRunnerEvent[e])));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   */
  report(type: SpecRunnerEvent, payload: any, err?: Error) {
    const message = formatReportMessage(type, payload, err);
    message.runnerId = this.runnerId;
    message.stats = { passed: this.stats.passes, failed: this.stats.failures };

    if (this.isForked) {
      process.send && process.send(message);
    } else if (this.qaReporter && this.qaReporterMessages) {
      const { type } = message;
      if (this.qaReporterMessages.length === 0 || this.qaReporterMessages.indexOf(type) >= 0) {
        this.qaReporter.emit(message.type, message);
      }
    } else {
      info(message);
    }
  }
}

export function formatReportMessage(type: SpecRunnerEvent, payload: any, err?: Error) {
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
  if (err) {
    message.error = err;
  }
  return message;
}
