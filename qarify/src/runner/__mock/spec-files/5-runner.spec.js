import { _getGlobal, GLOBAL_RUNNER } from "qarify";

test('global runner variable should be set', () => {
  expect(__qyrunner__).toBeDefined();
  expect(__qyrunner__.context && __qyrunner__.context.framework).toBeTruthy();
  expect(__qyrunner__.context && __qyrunner__.context.instance).toBeTruthy();
  expect(__qyrunner__ === _getGlobal(GLOBAL_RUNNER)).toBe(true);
});
