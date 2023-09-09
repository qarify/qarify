import type { QArifyResult, QADriver, QARunner } from "@qarify/types";
import { getLogger, isSilent } from '@qarify/logger';

import { runSpecFiles } from "./run-specs.js";
import { setGlobalExpect, setGlobalDriver } from "./set-globals.js";
import { closeSession, makeSession } from "../driver/session.js";
import { getDriver } from "../driver/driver.js";
import { _setGlobal } from "../global/index.js";

const log = getLogger('runner:runner');

let _runner: Readonly<QARunner> | undefined;

export function getQARunner() { return _runner; }

export function getQARunnerProp(name: keyof QARunner) {
  if (!_runner) return undefined;
  return _runner[name];
}

export async function runQARunner(
  runner: QARunner,
): Promise<QArifyResult[]> {
  _runner = runner;
  try {
    if (!runner.context) { runner.context = {}; }
    const { testOptions, drivers, name, specs, runnerId } = runner;

    if (!specs || !specs.length) {
      if (!runner.ignoreNoFiles) {
        throw new Error('No spec files. Check the "specs" property in the QArify config');
      }
      if (!isSilent()) {
        console.warn('No spec files');
      }
      log('no spec files');
    }
    // set global
    _setGlobal('qyrunner', _runner);
    // expect
    setGlobalExpect({
      wait: testOptions.waitforTimeout, // ms to wait for expectation to succeed
      interval: testOptions.waitforInterval, // interval between attempts
    });

    let res: QArifyResult[] = [];
    const _isMultiremote = false;

    for (const driver of drivers) {
      log(`run "${name}" with ${driver.name} driver`);
      
      const _browser = driver.capabilities ? await _makeConnection(driver, _isMultiremote) : null;
      if (_browser) {
        setGlobalDriver(_browser, _isMultiremote);
      }

      res.push(await runSpecFiles(runner, `${runnerId}:${driver.name}`));

      if (_browser && !driver.session) {
        closeSession(_browser.sessionId);
        // await _browser.deleteSession();
      }
    }

    return res;
  } catch (e) {
    throw e;
  } finally {
    _runner = undefined;
    _setGlobal('qyrunner', undefined);
  }
}

/**
 * make a driver session
 * @param driver 
 * @param isMultiremote 
 * @returns driver instance
 */
async function _makeConnection(
  driver: QADriver,
  isMultiremote?: boolean
): Promise<WebdriverIO.Browser | undefined> {
  const session = await makeSession(driver, isMultiremote);
  return getDriver(session.sessionId);
}
