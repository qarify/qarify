import debug from 'debug';
import { LogLevel, LogLevelName } from '@qarify/types';

const RootNS = 'qarify';

enum _ns_prefix {
  debug = ``,
  info = `I`,
  error = `E`,
}

export type LogGetterName = Exclude<LogLevelName, 'silent'>

type LoggerCache = {
  [name: string]: debug.Debugger;
};

const _cache: LoggerCache = {};

const _logger = debug(`${RootNS}`);

let _logLevel = LogLevel.error;

let _logNamespace: string | undefined = undefined;

export function getLogLevel() {
  return _logLevel;
}

export function getLogNamespace() {
  return _logNamespace;
}

/**
 * bind log to the specified logger
 */
export function bindLogger(logger: debug.Debugger, name: 'log' | 'warn' | 'error') {
  logger.log = console[name].bind(console);
}

export const isSilent = () => _logLevel === LogLevel.silent;

export function setLogLevel(level:LogLevel, enable=false) {
  _logLevel = level;
  debug.disable();

  if (level === LogLevel.silent || !enable) {return;}
  if (level === LogLevel.debug) {
    // enable all(debug, info, error)
    debug.enable(`${RootNS}:*`);
  } else if (level === LogLevel.info) {
    // enable 'info' and 'error'
    debug.enable(`${RootNS}:${_ns_prefix.info}:*,${RootNS}:${_ns_prefix.error}:*`);
  } else {
    // enable 'error' only
    debug.enable(`${RootNS}:${_ns_prefix.error}:*`);
  }
}

export function setLogLevelName(level: LogLevelName, enable=false) {
  return setLogLevel(LogLevel[level], enable);
}

export function getLogger(name?: string, level: LogGetterName = 'debug') {
  if (!name) { return _logger; }

  const key = `${_ns_prefix[level] ? (_ns_prefix[level] + ':') : ''}${name}`;
  const ns = `${RootNS}:${key}`;
  if (!_cache[key]) {
    _cache[key] = _logger.extend(key);
    // bind logger to console.log
    // By default, logger is bound to console.error.
    _cache[key].log = console.log.bind(console);
  }
  if (debug.enabled(_ns_prefix[level]) && !debug.enabled(ns)) {
    debug.enable(ns);
  }
  return _cache[key];
}

export function disableLogger() {
  debug.disable();
}
