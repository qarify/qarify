import type { MochaOptions } from "mocha";
import { EventEmitter } from "events";
import {
  type ReportMessage, type QARunnerReporter
} from '../types.js';
import { SpecRunnerEvent, } from '../constants.js';

export class TestReporter extends EventEmitter implements QARunnerReporter {

  private runnerId: string;

  constructor(options?: MochaOptions) {
    super();
    const reporterOptions = (options && options.reporterOptions) || {};
    this.runnerId = reporterOptions.runnerId || `${Date.now()}`;

    this.report = this.report.bind(this);
    Object.keys(SpecRunnerEvent).forEach((e) => this.on(e, this.report));
    // listen runner events
    // (
    //   Object.keys(MochaRunnerEvent) as Array<keyof typeof MochaRunnerEvent>
    // ).forEach((e) => this.on(e, this.report.bind(this, MochaRunnerEvent[e])));
  }
  setOptions(options?: MochaOptions | undefined) {}

  /**
   * Invoked by test runner whenever any event's been emitted.
   * @param msg 
   */
  report(type: SpecRunnerEvent, message: ReportMessage) {
    message.runnerId = this.runnerId;

    console.log(message);
  }
}
