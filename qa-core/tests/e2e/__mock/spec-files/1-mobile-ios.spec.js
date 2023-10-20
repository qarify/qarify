import { _getGlobal, GLOBAL_RUNNER } from "@qarify/core";

test('global variables should be defined', () => {
  expect(driver).toBeDefined();
  expect(typeof driver).toBe('object');
  expect($).toBeDefined();
  expect(typeof $).toBe('function');
  expect($$).toBeDefined();
  expect(typeof $$).toBe('function');
  expect(__qyrunner__).toBeDefined();
  expect(typeof __qyrunner__).toBe('object');
  expect(typeof __qyrunner__.context).toBe('object');
  expect(__qyrunner__.context && __qyrunner__.context.framework).toBeTruthy();
  expect(typeof __qyrunner__.context.framework).toBe('object');
  expect(__qyrunner__.context && __qyrunner__.context.instance).toBeTruthy();
  expect(typeof __qyrunner__.context.instance).toBe('object');

  expect(__qyrunner__ === _getGlobal(GLOBAL_RUNNER)).toBe(true);
});
