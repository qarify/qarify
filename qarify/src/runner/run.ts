import { remote, multiremote, attach, type AttachOptions } from "webdriverio";
import { expect as _expect, setOptions } from "expect-webdriverio";

import type { QAConfig, QArifyResult, QADriver } from "../types.js";
import { _setGlobal } from "../global/index.js";
import { runSpecFiles } from "./test-runner.js";

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
  const { testOptions, drivers } = config;
  // expect
  _setGlobal("expect", _expect);
  setOptions({
    wait: testOptions.waitforTimeout, // ms to wait for expectation to succeed
    interval: testOptions.waitforInterval, // interval between attempts
  });

  let res: QArifyResult[] = [];
  if (drivers && drivers.length) {
    const _isMultiremote = false;
    for (const driver of drivers) {
      let _browser;
      if (drivers && drivers.length > 0) {
        _browser = await initialiseConnection(driver, _isMultiremote);
        _setGlobal("browser", _browser);
        _setGlobal("driver", _browser);
        if (_isMultiremote) {
          _setGlobal("multiremotebrowser", _browser);
        }
      }
      
      res.push({
        name: config.name,
        driver: driver.name,
        failed: await runSpecFiles(files, config, `${config.name}`)
      });

      if (_browser) {
        await _browser.deleteSession();
      }
    }
  } else {
    res.push({
      name: config.name,
      failed: await runSpecFiles(files, config, `${config.name}`)
    });
  }

  return res;
}
