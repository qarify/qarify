import type { QArifyResult, QADriver, QARunner } from "@qarify/types";
import { getLogger, isSilent } from '@qarify/logger';

import { GLOBAL_RUNNER } from "../constants.js";
import { runSpecFiles } from "./run-specs.js";
import { setGlobalExpect, setGlobalDriver } from "./set-globals.js";
import { closeSession, makeSession } from "../driver/session.js";
import { getDriver } from "../driver/driver.js";
import { _setGlobal } from "../global/index.js";
import { filterSpecs } from '../utils/index.js';

const log = getLogger('runner:runner');

let _runner: QARunner | undefined;

export function getQARunner() { return _runner as Readonly<QARunner>; }

export function getQARunnerProp(name: keyof QARunner) {
  if (!_runner) return undefined;
  return _runner[name];
}

const _checkSpecsEmpty = (specs: string[], ignoreNoFiles?: boolean) => {
  if (!specs || !specs.length) {
    if (!ignoreNoFiles) {
      throw new Error('No spec files. Check the "specs" property in the QArify config');
    }
    if (!isSilent()) {
      console.warn('No spec files');
    } else {
      log('No spec files');
    }
    return false;
  }
  return true;
}

export async function runQARunner(
  runner: QARunner,
): Promise<QArifyResult[]> {
  // clone
  _runner = structuredClone(runner);

  try {
    if (!_runner.context) { _runner.context = {}; }
    const { testOptions, drivers, name, specs, runnerId, ignoreNoFiles } = _runner;
    _checkSpecsEmpty(specs, ignoreNoFiles);
    // set global
    _setGlobal(GLOBAL_RUNNER, _runner);
    // expect
    setGlobalExpect({
      wait: testOptions.waitforTimeout, // ms to wait for expectation to succeed
      interval: testOptions.waitforInterval, // interval between attempts
    });

    let res: QArifyResult[] = [];
    const _isMultiremote = false;

    for (const driver of drivers) {
      const { name: driverName, capabilities, ignore, session } = driver;
      log(`run "${name}" with ${driverName} driver`);
      
      const _browser = capabilities ? await _makeConnection(driver, _isMultiremote) : null;
      if (_browser) {
        setGlobalDriver(_browser, _isMultiremote);
      }

      const filteredSpecs = filterSpecs(specs, ignore);
      if (_checkSpecsEmpty(filteredSpecs, ignoreNoFiles)) {
        _runner.specs = filteredSpecs;
        res.push(await runSpecFiles(_runner, `${runnerId}:${driverName}`));
      }

      if (_browser && !session) {
        closeSession(_browser.sessionId);
        // await _browser.deleteSession();
      }
    }
    // return result
    return res;
  } catch (e) {
    throw e;
  } finally {
    _runner = undefined;
    _setGlobal(GLOBAL_RUNNER, undefined);
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
