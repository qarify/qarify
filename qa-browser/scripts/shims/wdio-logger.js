import loggerFactory from 'debug';

const LOG_FUNC_NAME = ['error', 'warn', 'info', 'debug', 'trace'];
const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug', 'trace'];
const silent = (args) => { };
const DEFAULT_LEVEL = 'info';
const _loggers = {};
const _fillLogFunc = (logger) => {
    const level = LOG_LEVELS.indexOf(logger.level);
    LOG_FUNC_NAME.forEach((e, idx) => {
        logger[e] = (idx < level) ? logger._fn : silent;
    });
    return logger;
};
export default function getLogger(name) {
    if (!_loggers[name]) {
        _loggers[name] = _fillLogFunc({
            _fn: loggerFactory(name),
            level: DEFAULT_LEVEL,
        });
    }
    return _loggers[name];
}
// logging interface expects a 'setLevel' method
getLogger.setLevel = (name, level) => {
    if (!_loggers[name]) {
        return;
    }
    _loggers[name].level = level;
    _fillLogFunc(_loggers[name]);
};
getLogger.setLogLevelsConfig = () => { };
getLogger.waitForBuffer = () => { };
getLogger.clearLogger = () => { };
