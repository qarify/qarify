import { remote, multiremote, attach } from "webdriverio";
import { expect as _expect, setOptions } from "expect-webdriverio";

// import type { QAConnectionInfo, QAConfig, QAProject } from "../../types";
import { _setGlobal } from "../global/index.js";
import { executeTestSuite } from "./execute-test-suite.js";

/**
 * initialise connection depending whether remote or multiremote is requested
 * @param  {Object}  connection        configuration of sessions
 * @param  {Object}  capabilities  desired session capabilities
 * @param  {boolean} isMultiremote isMultiremote
 * @return {Promise}               resolves with browser object
 */
async function initialiseConnection(
  connection: QAConnectionInfo,
  isMultiremote?: boolean
): Promise<WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser> {
  const { capabilities, sessionId } = connection;

  if (sessionId) {
    return attach({
      ...connection,
      capabilities,
    } as Required<QAConnectionInfo>);
  }

  if (!isMultiremote) {
    return remote(connection);
  }

  throw new Error("Invalid connection");

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

export async function runProject(project: Required<QAProject>, config: QAConfig) {
  const { connection, options } = project;
  const _isMultiremote = false;
  let _browser;
  if (connection) {
    _browser = await initialiseConnection(connection, _isMultiremote);
    _setGlobal("browser", _browser);
    _setGlobal("driver", _browser);
    if (_isMultiremote) {
      _setGlobal('multiremotebrowser', _browser);
    }
  }
  // expect
  _setGlobal("expect", _expect);
  setOptions({
    wait: options.waitforTimeout, // ms to wait for expectation to succeed
    interval: options.waitforInterval, // interval between attempts
  });

  const promises = project.testSuites.map((e) =>
    executeTestSuite(e, project, config, `${project.id}:${e.name}`)
  );
  const res = await Promise.all(promises);

  if (_browser) {
    await _browser.deleteSession();
  }
  return res;
}
