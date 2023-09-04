import type { QADriver } from "@qarify/types";
import { expect } from 'expect-webdriverio';
import { makeSession, closeSession, getDriver } from "../../src/driver/index.js";

const qadriver: QADriver = {
  id: 'local-server',
  name: "Local Server",
  protocol: "http",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  capabilities: {
    platformName: "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "iPhone 14",
    "appium:platformVersion": "16.4",
    "appium:orientation": "PORTRAIT",
  },
};

describe("driver", () => {
  it("should make a session", async function() {
    this.timeout(10000); // 10s

    // make a session
    const res = await makeSession(qadriver);
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
