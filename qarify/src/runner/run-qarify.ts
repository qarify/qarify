import { remote, multiremote, attach, type AttachOptions } from "webdriverio";
import type { QAConfig, QArifyResult, QADriver, QARunnerOptions } from "@qarify/types";

import { runSpecFiles } from "./run-specs.js";
import { setGlobalExpect, setGlobalDriver } from "./set-globals.js";
import { updateConfigWithRunOptions } from '../utils/helpers.js';
import { getLogger, isSilent } from "../logger/logger.js";

const log = getLogger('runner:run-qarify');

export async function runQArify(
  files: string[],
  config: QAConfig,
  options: QARunnerOptions = {},
): Promise<QArifyResult[]> {
  const _config = updateConfigWithRunOptions(config, files, options);
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
    const _browser = driver.name ? await makeConnection(driver, _isMultiremote) : null;
    if (_browser) {
      setGlobalDriver(_browser, _isMultiremote);
      log(`run "${name}" w/ driver, ${driver.name}`);
    } else {
      log(`run "${name}" w/o driver`);
    }

    res.push(await runSpecFiles(specs, _config, `${name}:${driver.name}`));

    if (_browser && !driver.session) {
      await _browser.deleteSession();
    }
  }

  return res;
}


/**
 * initialise connection depending whether remote or multiremote is requested
 * @param driver        configuration of sessions
 * @param capabilities  desired session capabilities
 * @param isMultiremote isMultiremote
 * @return resolves with browser object
 */
async function makeConnection(
  driver: QADriver,
  isMultiremote?: boolean
): Promise<WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser> {
  const { capabilities, session } = driver;


  if (session) {
    log(`make connection, ${driver.name} with session,`, session);
    return attach({
      ...session,
      capabilities,
    } as AttachOptions);
  }

  log(`make connection, ${driver.name} w/o session`);
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
