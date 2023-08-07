import { expect } from 'expect-webdriverio';

export default function() {
  const greeting = 'hello';
  expect(greeting).toBe('hello');
};
