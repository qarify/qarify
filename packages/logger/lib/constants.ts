export const IS_DEV = process.env.NODE_ENV !== 'production';
export const LOG_LEVEL =
  typeof process !== 'undefined' ? process.env.QY_LOG_LEVEL || (IS_DEV ? 'debug' : 'info') : 'info';

export const IS_BROWSER = typeof process !== 'undefined' && process.env.BROWSER === '1';
export const LOG_PRETTY = typeof process !== 'undefined' && process.env.LOG_PRETTY === 'true';

// dynamic file logger by log id such as sessionId, userId, traceId etc
export const LOG_DYNAMIC_FILE_KEY = typeof process !== 'undefined' && process.env.LOG_DYNAMIC_FILE_KEY;
