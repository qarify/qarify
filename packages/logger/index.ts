import {
  configure,
  getConsoleSink,
  getLogger,
  getAnsiColorFormatter,
  configureSync,
  type Config,
  type Sink,
  type LogLevel,
  getConfig,
} from '@logtape/logtape';
import { reconfigure } from './lib/reconfigure';
import { LOG_PRETTY, LOG_LEVEL, IS_BROWSER, LOG_DYNAMIC_FILE_KEY } from './lib/constants';
import { getDynamicFileSink } from './lib/dynamic-file-sink';
import { prettyFormatter } from './lib/pretty-formatter';

export type { LogLevel } from '@logtape/logtape';

export type Logger = ReturnType<typeof getLogger> & {
  close?: (logger: Logger) => Promise<void>;
};

export { DynamicLogFileManager } from './lib/dynamic-log-file-manager';

const initialConfig: Config<string, string> = {
  sinks: {
    console: getConsoleSink({
      formatter:
        LOG_PRETTY && !IS_BROWSER
          ? prettyFormatter
          : getAnsiColorFormatter({
              timeZone: 'asia/Seoul',
            }),
    }),
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: [] }, // Suppresses all meta logs
    { category: ['qy'], lowestLevel: LOG_LEVEL as any, sinks: ['console'] },
    { category: ['qy-web'], lowestLevel: LOG_LEVEL as any, sinks: ['console'] },
  ],
};
if (LOG_DYNAMIC_FILE_KEY) {
  initialConfig.sinks['dynamicFile'] = getDynamicFileSink(LOG_DYNAMIC_FILE_KEY);
  initialConfig.loggers.push({
    category: ['qy-dynamic'],
    lowestLevel: LOG_LEVEL as any,
    sinks: ['console', 'dynamicFile'],
  });
}

// setup
if (LOG_LEVEL !== 'silent') {
  // N.B. No top-level await: Cloud Functions emulator loads the bundle via require(), which rejects TLA.
  configureSync({ reset: true, ...initialConfig });
} else {
  configureSync({ sinks: {}, loggers: [{ category: ['logtape', 'meta'], sinks: [] }] });
}

export default function logger(names: string[] = ['qy']): Logger {
  return getLogger(names);
}

export async function setLogLevel(level: LogLevel | undefined, isPretty = true, names = 'qy') {
  // 1. get current config
  const config = getConfig() || initialConfig;

  // 2. Safely read or modify the active categories/levels
  const updatedLoggers =
    config.loggers?.map((logger) => {
      const isTarget = Array.isArray(logger.category) ? logger.category.includes(names) : logger.category === names;
      if (isTarget) {
        return { ...logger, lowestLevel: level }; // Update target level
      }
      return logger;
    }) ?? [];
  // 3. updated sinks for pretty
  const updatedSinks = config.sinks;
  if (isPretty) {
    updatedSinks.console = getConsoleSink({
      formatter: (await import('./lib/pretty-formatter')).prettyFormatter,
    });
  }

  // 4. Re-apply the configuration using the reset flag
  configureSync({
    reset: true,
    sinks: updatedSinks, // Re-use the existing sinks
    loggers: updatedLoggers,
  });
}

export async function getCustomLogger({
  names,
  sinkName,
  sink,
  sinkConsole,
  isFileSink,
  close,
}: {
  names: string[];
  sinkName: string;
  sink: Sink;
  sinkConsole?: boolean;
  isFileSink?: boolean;
  close?: (logger: Logger) => Promise<void>;
}) {
  await reconfigure({
    sinks: {
      [sinkName]: sink,
    },
    loggers: [{ category: names, sinks: sinkConsole ? ['console', sinkName] : [sinkName] }],
    ...(isFileSink ? { contextLocalStorage: new (await import('node:async_hooks')).AsyncLocalStorage() } : {}),
  });
  const d = getLogger(names) as Logger;
  d.close = close;
  return d;
}
