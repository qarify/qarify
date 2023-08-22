import { expect } from 'expect-webdriverio';

test('driver should be defined', () => {
  expect(driver).toBeDefined();
});

test('session should be defined', async () => {
  const session = await driver.getSession();
  expect(session).toBeDefined();
  expect(session.platformName === 'iOS' || session.platformName === 'Android').toBe(true);
});
