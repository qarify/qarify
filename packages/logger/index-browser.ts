import {
  getConsoleSink,
  getLogger,
  getAnsiColorFormatter,
  configureSync,
  type Config,
  type Sink,
} from '@logtape/logtape';
import { reconfigure } from './lib/reconfigure';
import { LOG_LEVEL } from './lib/constants';

export type { LogLevel } from '@logtape/logtape';

export type Logger = ReturnType<typeof getLogger>;

const initialConfig: Config<string, string> = {
  sinks: {
    console: getConsoleSink({
      formatter: getAnsiColorFormatter({
        timeZone: 'asia/Seoul',
      }),
    }),
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: [] }, // Suppresses all meta logs
    { category: 'qy', lowestLevel: LOG_LEVEL as any, sinks: ['console'] },
  ],
};

// setup
if (LOG_LEVEL !== 'silent') {
  configureSync({ reset: true, ...initialConfig });
}

export default function logger(names: string[] = ['qy']) {
  return getLogger(names);
}

export async function getCustomLogger({
  names,
  sinkName,
  sink,
  sinkConsole,
}: {
  names: string[];
  sinkName: string;
  sink: Sink;
  sinkConsole?: boolean;
  isFileSink?: boolean;
}) {
  await reconfigure({
    sinks: {
      [sinkName]: sink,
    },
    loggers: [{ category: names, sinks: sinkConsole ? ['console', sinkName] : [sinkName] }],
  });
  return getLogger(names);
}
