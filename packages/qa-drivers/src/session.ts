import { remote, attach } from 'webdriverio';
// import WebDriver from 'webdriver';
import type { QADriverOptions, QADriverSession, QADriver } from "@qarify/types";
import { getLogger } from '@qarify/logger';
import {
  getDriver, removeDriver, setDriver
} from './driver.js';

export const MJPEG_URL_CAP = 'mjpegScreenshotUrl' as const;

// const remote = WebDriver.newSession;
// const attach = WebDriver.attachToSession;

const log = getLogger('driver:session');

function _buildSession(driver: QADriver, options: QADriverOptions) {
  setDriver(driver.sessionId, driver);

  const mjpegScreenshotUrl: string | undefined = driver.capabilities[MJPEG_URL_CAP as keyof typeof driver.capabilities] || undefined;
  // const mjpegScreenshotPort = driver.capabilities[`appium:${MJPEG_PORT_CAP}`] || driver.capabilities[MJPEG_PORT_CAP] || null;
  // const mjpegScreenshotUrl = mjpegScreenshotPort && isMjepgAvailable ? 
  // `${options.protocol}://${options.hostname}:${mjpegScreenshotPort}` : undefined;

  const session: QADriverSession = {
    ...options,
    sessionId: driver.sessionId,
    capabilities: driver.capabilities as WebdriverIO.Capabilities,
    isW3C: driver.isW3C,
    isAndroid: driver.isAndroid,
    isIOS: driver.isIOS,
    mjpegScreenshotUrl,
  };

  return session;
}

/**
 * initialise connection depending whether remote or multiremote is requested
 * @param options        configuration of sessions
 * @param capabilities  desired session capabilities
 * @param isMultiremote isMultiremote
 * @return resolves with browser object
 */
export async function makeSession(
  options: QADriverOptions,
  isMultiremote?: boolean
): Promise<QADriverSession> {
  const { capabilities, session } = options;

  if (session && session.sessionId) {
    //
    // use existing session
    //
    const { sessionId } = session;
    let driver = getDriver(sessionId);
    if (driver) {
      log(`found existing driver, ${options.name}`);
      // try to connect
    } else {
      log(`attach connection with session of ${options.name}, ${sessionId}`);
      driver = await attach({ options: session, sessionId, capabilities });
    }
    return _buildSession(driver, options);
  }

  //
  // make new session
  //
  if (session) {
    delete options.session;
  }
  log(`make new connection with ${options.name}`);
  if (!isMultiremote) {
    let driver = await remote(options);
    return _buildSession(driver, options);
  }

  throw new Error("Invalid driver");
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
    console.error(e);
    /** IGNORE */
  } finally {
    removeDriver(sessionId);
  }
  return res;
}
