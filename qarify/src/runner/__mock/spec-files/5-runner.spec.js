
test('global variables should be defined', () => {
  //@ts-ignore
  expect(qyrunner).toBeDefined();
  //@ts-ignore
  expect(qyrunner.context.framework).toBeDefined();
  //@ts-ignore
  expect(qyrunner.context.instance).toBeDefined();
});
