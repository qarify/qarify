import type { QAPageNodeAttribute } from '@qarify/types';
import { FindStrategy } from '@qarify/types';

export const GLOBAL_RUNNER = '__qyrunner__' as const;
export const GLOBAL_CONFIG = '__qaconfig__' as const;

export const MAX_SUPPORT_VERSION = 10000; //'1.0';
export const MIN_SUPPORT_VERSION = 10000; //'1.0';

// Map of the optimal strategies.
export const STRATEGY_MAPPINGS: [keyof QAPageNodeAttribute, FindStrategy][] = [
  ['axId', FindStrategy.AccessibilityId],         // for universal
  ['content-desc', FindStrategy.AccessibilityId], // for android
  ['name', FindStrategy.AccessibilityId],         // for ios
  ['id', FindStrategy.Id],                        // for universal(android)
  ['resource-id', FindStrategy.Id],               // for android
  ['class', FindStrategy.ClassName],              // for android
  ['type', FindStrategy.ClassName],               // for ios
];
