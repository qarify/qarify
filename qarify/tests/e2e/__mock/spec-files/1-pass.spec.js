
test('global variables should be defined', () => {
  expect(driver).toBeDefined();
  expect($).toBeDefined();
  expect($$).toBeDefined();
  expect(qyrunner).toBeDefined();
  expect(qyrunner.context.framework).toBeDefined();
  expect(qyrunner.context.instance).toBeDefined();
});
