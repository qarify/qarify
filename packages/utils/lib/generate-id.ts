// Exactly 64 chars: `& 63` maps each random byte onto it with zero modulo bias. Don't change its length.
const ALPHABET = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
const ID_PATTERN_21 = /^[A-Za-z0-9_-]{21}$/;

export function generateId(length: number = 21): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError(`length must be a positive integer, got ${length}`);
  }

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let id = '';
  for (let i = 0; i < length; i++) {
    id += ALPHABET[bytes[i]! & 63];
  }
  return id;
}

export const isValidId21 = (id: string): boolean => ID_PATTERN_21.test(id);
