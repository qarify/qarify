import type { QAPageNodeAttribute } from '@qarify/types';
import { FindStrategy } from '@qarify/types';

export const GLOBAL_RUNNER = '__qyrunner__' as const;
export const GLOBAL_CONFIG = '__qaconfig__' as const;

export const MAX_SUPPORT_VERSION = 10000; //'1.0';
export const MIN_SUPPORT_VERSION = 10000; //'1.0';

// Map of the optimal strategies.
export const STRATEGY_MAPPINGS: [keyof QAPageNodeAttribute, FindStrategy][] = [
  ['axId', FindStrategy.AccessibilityId],
  ['name', FindStrategy.AccessibilityId],
  // ['content-desc', FindStrategy.AccessibilityId],
  ['id', FindStrategy.Id],
  ['rntestid', FindStrategy.Id],
  ['resource-id', FindStrategy.Id],
  ['class', FindStrategy.ClassName],
  ['type', FindStrategy.ClassName],
];
