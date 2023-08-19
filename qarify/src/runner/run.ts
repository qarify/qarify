import { remote, multiremote, attach, type AttachOptions } from "webdriverio";
import { expect as _expect, setOptions, type Expect, type DefaultOptions } from "expect-webdriverio";
import debug from 'debug';

import type { QAConfig, QArifyResult, QADriver, QARunnerOptions } from "../types.js";
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
  const { capabilities, session } = driver;

  if (session) {
    return attach({
      ...session,
      capabilities,
    } as AttachOptions);
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

export function setGlobalExpect(options?: DefaultOptions, expect?: Expect) {
  _setGlobal("expect", expect || _expect);
  options && setOptions(options);
}

export function setGlobalDriver(driver: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser, isMultiremote = false) {
  _setGlobal("browser", driver);
  _setGlobal("driver", driver);
  _setGlobal("$", driver.$.bind(driver));
  _setGlobal("$$", driver.$$.bind(driver));
  if (isMultiremote) {
    _setGlobal("multiremotebrowser", driver);
  }
}

export async function runQA(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions = {},
): Promise<QArifyResult[]> {
  const { testOptions, drivers, name } = config;
  // expect
  setGlobalExpect({
    wait: testOptions.waitforTimeout, // ms to wait for expectation to succeed
    interval: testOptions.waitforInterval, // interval between attempts
  });

  let res: QArifyResult[] = [];
  let _drivers: QADriver[] = [];

  if (options.drivers && options.drivers.length) {
    if (drivers && drivers.length) {
      _drivers.push(...drivers.filter((e) => options.drivers?.find((n) => n === e.name)));
    }
  } else {
    if (drivers && drivers.length) {
      _drivers = drivers;
    } else {
      _drivers.push({ name: '' } as QADriver);
    }
  }
  const _isMultiremote = false;
  for (const driver of _drivers) {
    const _browser = driver.name ? await initialiseConnection(driver, _isMultiremote) : null;
    if (_browser) {
      setGlobalDriver(_browser, _isMultiremote);
      log(`run ${name} w/ ${driver.name}`);
    } else {
      log(`run ${name} w/o driver`);
    }

    res.push(await runSpecFiles(files, config, `${name}:${driver.name}`));

    if (_browser && !driver.session) {
      await _browser.deleteSession();
    }
  }

  return res;
}
