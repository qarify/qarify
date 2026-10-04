import { getConfig, configure, type Config, configureSync } from '@logtape/logtape';
import { IS_BROWSER } from './constants';

function isSameName(obj1: string | string[], obj2: string | string[]) {
  const s1 = Array.isArray(obj1) ? obj1 : [obj1];
  const s2 = Array.isArray(obj2) ? obj2 : [obj2];

  if (s1.length !== s2.length) {
    return false;
  }

  return s1.every((v, i) => v === s2[i]);
}

export async function reconfigure(newConfig?: Config<string, string>) {
  let currentConfig = getConfig() || ({} as Config<string, string>);
  const filteredLoggers = (currentConfig.loggers || []).filter((logger) => {
    return !newConfig?.loggers?.find((e) => isSameName(e.category, logger.category));
  });

  if (IS_BROWSER) {
    configureSync({
      reset: true,
      ...currentConfig,
      ...(newConfig || {}),
      sinks: {
        ...currentConfig?.sinks,
        ...(newConfig?.sinks || {}),
      },
      loggers: [...filteredLoggers, ...(newConfig?.loggers || [])],
    });
  } else {
    await configure({
      reset: true,
      ...currentConfig,
      ...(newConfig || {}),
      sinks: {
        ...currentConfig?.sinks,
        ...(newConfig?.sinks || {}),
      },
      loggers: [...filteredLoggers, ...(newConfig?.loggers || [])],
    });
  }
}
