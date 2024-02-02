import { describe, expect, it } from 'vitest';
import {
  LogLevel, setLogLevel, getLogger, setLogLevelName, disableLogger
} from "@qarify/browser";

describe('logger', function() {
  it('should be disabled initially', function() {
    expect(getLogger('ie', 'debug').enabled).toBeFalsy();
    expect(getLogger('ie', 'info').enabled).toBeFalsy();
    expect(getLogger('ie', 'error').enabled).toBeFalsy();
  });

  it('should disable all', function() {
    disableLogger();
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(false);
  });

  it('should be disabled initially', function() {
    setLogLevel(LogLevel.silent);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(false);

    setLogLevelName('silent');
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(false);
  });

  it('should set log level', function() {
    setLogLevel(LogLevel.debug, true);
    expect(getLogger('ie', 'debug').enabled).toBe(true);
    expect(getLogger('ie', 'info').enabled).toBe(true);
    expect(getLogger('ie', 'error').enabled).toBe(true);

    setLogLevel(LogLevel.info, true);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(true);
    expect(getLogger('ie', 'error').enabled).toBe(true);

    setLogLevel(LogLevel.error, true);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(true);

    setLogLevel(LogLevel.silent, true);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(false);
  });

  it('should set log level by namespace', function() {
    setLogLevelName('debug', true);
    expect(getLogger('ie', 'debug').enabled).toBe(true);
    expect(getLogger('ie', 'info').enabled).toBe(true);
    expect(getLogger('ie', 'error').enabled).toBe(true);

    setLogLevelName('info', true);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(true);
    expect(getLogger('ie', 'error').enabled).toBe(true);

    setLogLevelName('error', true);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(true);

    setLogLevelName('silent', true);
    expect(getLogger('ie', 'debug').enabled).toBe(false);
    expect(getLogger('ie', 'info').enabled).toBe(false);
    expect(getLogger('ie', 'error').enabled).toBe(false);
  });
});
