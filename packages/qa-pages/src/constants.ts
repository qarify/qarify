import type { QAPageNodeAttribute } from '@qarify/types';
import { FindStrategy } from '@qarify/types';

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
