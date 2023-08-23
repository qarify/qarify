import { EventEmitter } from "events";
import {
  type ReportMessage, type QARunnerReporter
} from '../types.js';
import { SpecRunnerEvent, } from '../constants.js';

export class ConsoleReporter extends EventEmitter implements QARunnerReporter {
  constructor(options?: any) {
    super();
    // this.report = this.report.bind(this);
    // Object.values(SpecRunnerEvent).forEach((e) => this.on(e, this.report));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   */
  report(type: SpecRunnerEvent, message: ReportMessage) {
    console.log(type, message);
  }
}
