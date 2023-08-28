import debug from 'debug';
import { LogLevel } from '@qarify/types';

const RootNS = 'qarify';

enum _ns_prefix {
  debug = ``,
  info = `i`,
  error = `i:e`,
}

export type LogLevelName = keyof typeof _ns_prefix;
type LoggerCache = {
  [name: string]: debug.Debugger;
};

const _cache: LoggerCache = {};

const _logger = debug(`${RootNS}`);

let _logLevel = LogLevel.error;

export function getLogLevel() {
  return _logLevel;
}

/**
 * bind logger to console.log
 * By default, logger is bound to console.error.
 */
export function bindConsoleLog() {
  _logger.log = console.log.bind(console);
}

export const isSilent = () => _logLevel === LogLevel.silent;

export function setLogLevel(level:LogLevel, enable=false) {
  _logLevel = level;
  debug.disable();

  if (level === LogLevel.silent || !enable) {return;}
  if (level === LogLevel.debug) {
    debug.enable(`${RootNS}:${_ns_prefix.debug}*`);
  } else if (level === LogLevel.info) {
    debug.enable(`${RootNS}:${_ns_prefix.info}:*`);
  } else {
    debug.enable(`${RootNS}:${_ns_prefix.error}:*`);
  }
}

export function getLogger(name?: string, level: LogLevelName = 'debug') {
  if (!name) { return _logger; }

  const key = `${_ns_prefix[level] ? (_ns_prefix[level] + ':') : ''}${name}`;
  const ns = `${RootNS}:${key}`;
  if (!_cache[key]) {
    _cache[key] = _logger.extend(key);
  }
  if (debug.enabled(_ns_prefix[level]) && !debug.enabled(ns)) {
    debug.enable(ns);
  }
  return _cache[key];
}

export function enableLogger(namespaces = `${RootNS}:*`) {
  debug.enable(namespaces);
}

export function disableLogger() {
  debug.disable();
}
