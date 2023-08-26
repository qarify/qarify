
test('driver should be defined', () => {
  expect(driver).toBeDefined();
  expect($).toBeDefined();
  expect($$).toBeDefined();
  expect(typeof $).toBe('function');
  expect(typeof $$).toBe('function');
});

test('session should be defined', async () => {
  const session = await driver.getSession();
  expect(session).toBeDefined();
  expect(session.platformName === 'iOS' || session.platformName === 'Android').toBe(true);
});
