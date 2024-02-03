import loggerFactory from 'debug';

const LOG_FUNC_NAME = ['error', 'warn', 'info', 'debug', 'trace'];
const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug', 'trace'];
const silent = (/** @type {any} */ _args) => { };
const DEFAULT_LEVEL = 'info';

/**@typedef {typeof LOG_LEVELS[number]} LOG_LEVELS */
/**@typedef {{ _fn: import('debug').Debugger, level: LOG_LEVELS }} BareLogger */
/**@typedef {{ [name in LOG_LEVELS]: import('debug').Debugger | typeof silent }} FullLogger */
/**@typedef {BareLogger & FullLogger} Logger */
/**@type {Record<string, Logger>} */
const _loggers = {};
const _fillLogFunc = (/** @type {Logger} */ logger) => {
    const level = LOG_LEVELS.indexOf(logger.level);
    LOG_FUNC_NAME.forEach((e, idx) => {
        logger[e] = (idx < level) ? logger._fn : silent;
    });
    return logger;
};
/**
 * @param {string} name
 */
export default function getLogger(name) {
    if (!_loggers[name]) {
        _loggers[name] = _fillLogFunc(/**@type Logger*/({
            _fn: loggerFactory(name),
            level: DEFAULT_LEVEL,
        }));
    }
    return _loggers[name];
}
// logging interface expects a 'setLevel' method
getLogger.setLevel = (/** @type {string | number} */ name, /** @type {any} */ level) => {
    if (!_loggers[name]) {
        return;
    }
    _loggers[name].level = level;
    _fillLogFunc(_loggers[name]);
};
getLogger.setLogLevelsConfig = () => { };
getLogger.waitForBuffer = () => { };
getLogger.clearLogger = () => { };
