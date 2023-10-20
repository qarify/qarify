import path from "node:path";
import type { QAConfig, QADriver } from "@qarify/types";
import { SpecRunnerFramework } from "@qarify/types";
import { MAX_SUPPORT_VERSION } from "../../src/constants.js";

export const getDefaultQAConfig = (baseDir: string, override: Partial<QAConfig> = {}): QAConfig => ({
  version: `${(MAX_SUPPORT_VERSION / 10000).toFixed(0)}.${MAX_SUPPORT_VERSION % 1000}`,
  name: 'default',
  rootDir: baseDir,
  cacheDir: path.join(baseDir, '.qycache'),
  framework: SpecRunnerFramework.mocha_qunit,
  specs: [],
  drivers: [],
  testOptions: {
    waitforTimeout: 5000,
    waitforInterval: 1000,
  },
  ...override,
});

export const localIosDriver: QADriver = {
  id: 'local-server',
  name: "Local Server",
  protocol: "http",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  capabilities: {
    "platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "iPhone 14",
    "appium:platformVersion": "16.4",
    "appium:orientation": "PORTRAIT",
  },
  ignore: [],
};

export const localAndroidDriver: QADriver = {
  id: 'local-server',
  name: "Local Server",
  protocol: "http",
  hostname: "127.0.0.1",
  port: 4723,
  path: "/",
  capabilities: {
    "platformName": "android",
    "appium:automationName": "UiAutomator2",
    "appium:avd": "Pixel_API_33",
    "appium:platformVersion": "13.0",
    "appium:orientation": "PORTRAIT"
  },
  ignore: [],
};
