import { expect } from 'expect-webdriverio';
import {
  setLogLevel, getLogger, enableLogger, disableLogger, LogLevel
} from "./logger.js";

describe('logger', function() {
  it('should be undefined initially', function() {
    expect(getLogger('a', 'debug').enabled).toBeUndefined();
    expect(getLogger('a', 'info').enabled).toBeUndefined();
    expect(getLogger('a', 'error').enabled).toBeUndefined();
  });

  it('should be disabled initially', function() {
    setLogLevel(LogLevel.silent);
    expect(getLogger('a', 'debug').enabled).toBe(false);
    expect(getLogger('a', 'info').enabled).toBe(false);
    expect(getLogger('a', 'error').enabled).toBe(false);
  });

  it('should set log level', function() {
    setLogLevel(LogLevel.debug, true);
    expect(getLogger('a', 'debug').enabled).toBe(true);
    expect(getLogger('a', 'info').enabled).toBe(true);
    expect(getLogger('a', 'error').enabled).toBe(true);

    setLogLevel(LogLevel.info, true);
    expect(getLogger('a', 'debug').enabled).toBe(false);
    expect(getLogger('a', 'info').enabled).toBe(true);
    expect(getLogger('a', 'error').enabled).toBe(true);

    setLogLevel(LogLevel.error, true);
    expect(getLogger('a', 'debug').enabled).toBe(false);
    expect(getLogger('a', 'info').enabled).toBe(false);
    expect(getLogger('a', 'error').enabled).toBe(true);

    setLogLevel(LogLevel.silent, true);
    expect(getLogger('a', 'debug').enabled).toBe(false);
    expect(getLogger('a', 'info').enabled).toBe(false);
    expect(getLogger('a', 'error').enabled).toBe(false);
  });
});
