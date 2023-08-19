import { remote, multiremote, attach, type AttachOptions } from "webdriverio";
import { expect as _expect, setOptions } from "expect-webdriverio";
import debug from 'debug';

import type { QAConfig, QArifyResult, QADriver } from "../types.js";
import { _setGlobal } from "../global/index.js";
import { runSpecFiles } from "./test-runner.js";

const log = debug('qarify:runner:run');

/**
 * initialise connection depending whether remote or multiremote is requested
 * @param driver        configuration of sessions
 * @param capabilities  desired session capabilities
 * @param isMultiremote isMultiremote
 * @return resolves with browser object
 */
async function initialiseConnection(
  driver: QADriver,
  isMultiremote?: boolean
): Promise<WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser> {
  const { capabilities, sessionId } = driver;

  if (sessionId) {
    return attach({
      ...driver,
      capabilities,
    } as unknown as AttachOptions);
  }

  if (!isMultiremote) {
    return remote(driver);
  }

  throw new Error("Invalid driver");

  // const options: Record<string, Options.WebdriverIO> = {};
  // delete connection.capabilities;
  // for (const browserName of Object.keys(capabilities)) {
  //   options[browserName] = deepmerge(
  //     connection,
  //     (capabilities as Capabilities.MultiRemoteCapabilities)[browserName]
  //   );
  // }

  // const browser = await multiremote(options, connection);

  // /**
  //  * only attach to global environment if `injectGlobals` is set to true
  //  */
  // const browserNames = connection.injectGlobals
  //   ? Object.keys(capabilities)
  //   : [];
  // for (const browserName of browserNames) {
  //   // @ts-ignore allow random global browser names
  //   global[browserName] = browser[browserName];
  // }

  // return browser;
}

export async function runQA(
  files: string[],
  config: QAConfig
): Promise<QArifyResult[]> {
  const { testOptions, drivers, name } = config;
  // expect
  _setGlobal("expect", _expect);
  setOptions({
    wait: testOptions.waitforTimeout, // ms to wait for expectation to succeed
    interval: testOptions.waitforInterval, // interval between attempts
  });

  let res: QArifyResult[] = [];
  if (drivers && drivers.length) {
    log('driver length:', drivers.length);

    const _isMultiremote = false;
    for (const driver of drivers) {
      const _browser = await initialiseConnection(driver, _isMultiremote);
      _setGlobal("browser", _browser);
      _setGlobal("driver", _browser);
      if (_isMultiremote) {
        _setGlobal("multiremotebrowser", _browser);
      }

      log(`run ${name} w/ ${driver.name}`);
      const failed = await runSpecFiles(files, config, `${name}:${driver.name}`);
      res.push({ name, failed, driver: driver.name });

      await _browser.deleteSession();
    }
  } else {
    log(`run ${name} w/o driver`);
    const failed = await runSpecFiles(files, config, `${name}`);
    res.push({ name, failed });
  }

  return res;
}
