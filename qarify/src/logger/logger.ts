import debug from 'debug';

const RootNS = 'qarify';

export enum LogLevel {
  debug = 1,
  info,
  error,
  silent,
}
type _LogLevelName = keyof typeof LogLevel;
export type LogLevelName = Exclude<_LogLevelName, 'silent'>;
type Loggers = {
  [name in LogLevelName]: debug.Debugger;
};
type LoggerCache = {
  [name: string]: debug.Debugger;
};

const cache: LoggerCache = {};

const _root = debug(`${RootNS}`);
const logger: Loggers = {
  debug: _root,
  info: _root.extend(`i`),
  error: _root.extend(`ie`),
};

logger.debug.log = console.log.bind(console);
logger.info.log = console.log.bind(console);
// logger.warn.log = console.warn.bind(console);

export function setLogLevel(level:LogLevel, enable=false) {
  debug.disable();
  if (level === LogLevel.silent || !enable) {return;}
  if (level === LogLevel.debug) {
    debug.enable(`${RootNS}:*`);
  } else if (level === LogLevel.info) {
    debug.enable(`${RootNS}:i*`);
  } else {
    debug.enable(`${RootNS}:ie:*`);
  }
}

export function getLogger(name: string, level: LogLevelName = 'debug') {
  if (!cache[`${level}-${name}`]) {
    cache[`${level}-${name}`] = logger[level].extend(name);
  }
  if (debug.enabled(`${RootNS}:${level}`) && !debug.enabled(`${RootNS}:${level}:${name}`)) {
    debug.enable(`${RootNS}:${level}:${name}`);
  }
  return cache[`${level}-${name}`];
}

export function enableLogger(namespaces = `${RootNS}:*`) {
  debug.enable(namespaces);
}

export function disableLogger() {
  debug.disable();
}
