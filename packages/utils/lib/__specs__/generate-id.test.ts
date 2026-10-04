import { describe, expect, test } from 'bun:test';
import { generateId, isValidId21 } from '../generate-id';

const ALPHABET_CHARS = new Set('ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW');

describe('generateId', () => {
  test('defaults to length 21', () => {
    expect(generateId()).toHaveLength(21);
  });

  test('pass validation', () => {
    expect(isValidId21(generateId())).toBe(true);
  });

  test('respects a custom length', () => {
    expect(generateId(10)).toHaveLength(10);
  });

  test('only emits characters from the alphabet', () => {
    const id = generateId(500);
    for (const char of id) {
      expect(ALPHABET_CHARS.has(char)).toBe(true);
    }
  });

  test('generates unique ids with negligible collision rate', () => {
    const ids = new Set(Array.from({ length: 10_000 }, () => generateId()));
    expect(ids.size).toBe(10_000);
  });

  test.each([0, -1, 1.5])('throws for invalid length %p', (length) => {
    expect(() => generateId(length)).toThrow(RangeError);
  });
});
