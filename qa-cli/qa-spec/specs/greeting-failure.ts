import { expect } from 'expect-webdriverio';

test('should say hello too', () => {
  const greeting = 'hello world';
  expect(greeting).toBe('hello');
});
