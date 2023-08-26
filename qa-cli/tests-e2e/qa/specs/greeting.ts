import bye from '../tasks/bye.js';
import hello from '../tasks/hello.js';

before(async () => {
  await hello();
});

after(async () => {
  await bye();
});

test('should say hello', () => {
  const greeting = 'hello';
  expect(greeting).toBe('hello');
});
