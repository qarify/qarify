import { expect } from 'expect-webdriverio';

export default function() {
  const greeting = 'hello world';
  expect(greeting).toBe('hello');
};
