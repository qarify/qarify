import { EventEmitter } from "events";
import type {
  ReportMessage, QARunnerReporter, SpecRunnerEvent
} from '@qarify/types';

import { printMessage } from "./helpers.js";

/**
 * Console Reporter
 * 
 * 아무런 이벤트를 등록하지 않으면 모든 이벤트를 수신한다.
 * 특정 이벤트들만 수신하려면 아래 코드와 같이 이벤트를 등록한다.
 * 
 * `this.on(event_name, this.report)`
 */

export class ConsoleReporter extends EventEmitter implements QARunnerReporter {
  constructor() {
    super();

    // this.report = this.report.bind(this);
    // Object.values(SpecRunnerEvent).forEach((e) => this.on(e, this.report));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   */
  report(type: SpecRunnerEvent, message: ReportMessage) {
    printMessage(type, message);
  }
}
