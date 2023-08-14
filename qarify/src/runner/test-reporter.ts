import { MochaOptions, Runner, Stats, reporters } from "mocha";
import { SpecRunnerEvent, MochaRunnerEvent } from "../constants.js";
import type { ReportMessage } from "../types.js";

export class TestReporter extends reporters.Base {
  private runnerId: string;

  constructor(runner: Runner, options?: MochaOptions) {
    super(runner, options);
    const reporterOptions = (options && options.reporterOptions) || {};
    this.runnerId = reporterOptions.runnerId || `${Date.now}`;

    this.report = this.report.bind(this);
    // listen runner events
    (
      Object.keys(MochaRunnerEvent) as Array<keyof typeof MochaRunnerEvent>
    ).forEach((e) => runner.on(e, this.report.bind(this, MochaRunnerEvent[e])));
  }

  /**
   * Invoked by test runner whenever any event's been emitted.
   * @param msg
   */
  report(type: SpecRunnerEvent, payload: any, err?: Error) {
    const message = {
      type,
      runnerId: this.runnerId,
      stats: { passed: this.stats.passes, failed: this.stats.failures },
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
    // const { type, title, file,  } = test;
    // let event: SpecRunnerEvent;
    // console.log(">>> TEST:", test.title, test);
    // console.log(">>> TEST err:", err && err.stack);
    console.log(message);
    // if (payload) {
    //   if (type.startsWith('suite:start')) {
    //     console.log('>>> total():', payload.total());
    //     console.log('>>> CTX:', payload.ctx);
    //   }
    // }
  }
}
