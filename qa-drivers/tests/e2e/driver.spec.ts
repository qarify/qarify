import { expect } from 'expect-webdriverio';
import type { QADriver } from '@qarify/types';

import { makeSession, closeSession, getDriver } from "../../src/index.js";

export const localIosDriver: QADriver = {
  name: "Local Server",
  protocol: "http",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  capabilities: {
    "platformName": "iOS",
    "appium:deviceName": "iPhone 15 Pro",
    "appium:platformVersion": "17.0",
    "appium:automationName": "XCUITest",
    "appium:orientation": "PORTRAIT",
  },
  ignore: [],
};

export const localAndroidDriver: QADriver = {
  name: "Local Server",
  protocol: "http",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  capabilities: {
    "platformName": "android",
    //@ts-ignore
    "appium:avd": "Pixel_API_33",
    "appium:platformVersion": "13.0",
    "appium:automationName": "UiAutomator2",
    "appium:orientation": "PORTRAIT"
  },
  ignore: [],
};

describe("driver", () => {
  it("should make an ios session", async function() {
    this.timeout(30_000); // 30s

    // make a session
    const res = await makeSession(localIosDriver);
    expect(res).toBeDefined();

    // get driver instance
    let driver = getDriver(res.sessionId);
    expect(driver).toBeDefined();

    // close session
    const closed = await closeSession(res.sessionId);
    expect(closed).toBe(true);

    // check the closed session
    driver = getDriver(res.sessionId);
    expect(driver).toBeUndefined();
  });

  it.skip("should make an android session", async function() {
    this.timeout(30_000); // 30s

    // make a session
    const res = await makeSession(localAndroidDriver);
    expect(res).toBeDefined();

    // get driver instance
    let driver = getDriver(res.sessionId);
    expect(driver).toBeDefined();

    // close session
    const closed = await closeSession(res.sessionId);
    expect(closed).toBe(true);

    // check the closed session
    driver = getDriver(res.sessionId);
    expect(driver).toBeUndefined();
  });
});
