import type { Capabilities, Options } from '@wdio/types';
import WebDriver from 'webdriver';
import type { QADriver, QADriverSession, InternalDriver } from "@qarify/types";
import { getLogger } from '@qarify/logger';
import {
  getDriver, removeDriver, setDriver
} from './driver.js';

export const MJPEG_URL_CAP = 'mjpegScreenshotUrl' as const;

const remote = WebDriver.newSession;
const attach = WebDriver.attachToSession;

const log = getLogger('driver:session');

function _buildSession(driver: InternalDriver, options: Options.WebDriver) {
  setDriver(driver.sessionId, driver);

  const mjpegScreenshotUrl: string | undefined = driver.capabilities[MJPEG_URL_CAP as keyof typeof driver.capabilities] || undefined;
  // const mjpegScreenshotPort = driver.capabilities[`appium:${MJPEG_PORT_CAP}`] || driver.capabilities[MJPEG_PORT_CAP] || null;
  // const mjpegScreenshotUrl = mjpegScreenshotPort && isMjepgAvailable ? 
  // `${options.protocol}://${options.hostname}:${mjpegScreenshotPort}` : undefined;

  const session: QADriverSession = {
    ...options,
    sessionId: driver.sessionId,
    capabilities: driver.capabilities as Capabilities.Capabilities,
    isW3C: driver.isW3C,
    isAndroid: driver.isAndroid,
    isIOS: driver.isIOS,
    mjpegScreenshotUrl,
  };

  return session;
}

/**
 * initialise connection depending whether remote or multiremote is requested
 * @param qadriver        configuration of sessions
 * @param capabilities  desired session capabilities
 * @param isMultiremote isMultiremote
 * @return resolves with browser object
 */
export async function makeSession(
  qadriver: QADriver,
  isMultiremote?: boolean
): Promise<QADriverSession> {
  const { capabilities, session } = qadriver;

  if (session && session.sessionId) {
    //
    // use existing session
    //
    let driver = getDriver(session.sessionId);
    if (driver) {
      log(`found existing driver, ${qadriver.name}`);
      // try to connect
    } else {
      log(`attach connection with session of ${qadriver.name}, ${session.sessionId}`);
      driver = await attach({ ...session, capabilities });
    }
    return _buildSession(driver, qadriver);
  }

  //
  // make new session
  //
  if (session) {
    delete qadriver.session;
  }
  log(`make new connection with ${qadriver.name}`);
  if (!isMultiremote) {
    let driver = await remote(qadriver);
    return _buildSession(driver, qadriver);
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

export async function closeSession(sessionId: string) {
  let res = false;
  try {
    const driver = getDriver(sessionId);
    if (driver) {
      await driver.deleteSession();
    }
    res = true;
  } catch (e) {
    /** IGNORE */
  } finally {
    removeDriver(sessionId);
  }
  return res;
}
