import { expect } from 'expect-webdriverio';
import { makeSession, closeSession, getDriver } from "../../src/driver/index.js";
import { localDriver } from '../helper/default-qaconfig.js';

describe("driver", () => {
  it("should make a session", async function() {
    this.timeout(10000); // 10s

    // make a session
    const res = await makeSession(localDriver);
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
