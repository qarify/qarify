import { remote, multiremote, attach, type AttachOptions } from "webdriverio";
import type { QAConfig, QArifyResult, QADriver, QARunnerOptions } from "@qarify/types";
import { getLogger, isSilent } from '@qarify/logger';

import { runSpecFiles } from "./run-specs.js";
import { setGlobalExpect, setGlobalDriver } from "./set-globals.js";
import { updateConfigWithRunnerOptions } from '../utils/helpers.js';
import { closeSession, makeSession } from "../driver/session.js";
import { getDriver } from "../driver/driver.js";

const log = getLogger('runner:run-qarify');

export async function runQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions = {},
): Promise<QArifyResult[]> {
  const _config = updateConfigWithRunnerOptions(config, files, options);
  const { testOptions, drivers, name, specs } = _config;

  if (!specs || !specs.length) {
    if (!config.ignoreNoFiles) {
      throw new Error('No spec files. Check the "specs" property in the QArify config');
    }
    if (!isSilent()) {
      console.warn('No spec files');
    }
    log('no spec files');
  }

  // expect
  setGlobalExpect({
    wait: testOptions.waitforTimeout, // ms to wait for expectation to succeed
    interval: testOptions.waitforInterval, // interval between attempts
  });

  let res: QArifyResult[] = [];
  const _isMultiremote = false;

  for (const driver of drivers) {
    const _browser = driver.name ? await _makeConnection(driver, _isMultiremote) : null;
    if (_browser) {
      setGlobalDriver(_browser, _isMultiremote);
      log(`run "${name}" w/ driver, ${driver.name}`);
    } else {
      log(`run "${name}" w/o driver`);
    }

    res.push(await runSpecFiles(specs, _config, `${name}:${driver.name}`));

    if (_browser && !driver.session) {
      closeSession(_browser.sessionId);
      // await _browser.deleteSession();
    }
  }

  return res;
}


async function _makeConnection(
  driver: QADriver,
  isMultiremote?: boolean
): Promise<WebdriverIO.Browser | undefined> {
  const session = await makeSession(driver, isMultiremote);
  return getDriver(session.sessionId);
}
