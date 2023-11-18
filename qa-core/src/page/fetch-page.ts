import { getLogger } from '@qarify/logger';
import type {
  QAPageNode, QAPageRefreshOptions, PageParserOptions, FetchPageOptions,
} from '@qarify/types';
import { LRUCache } from 'lru-cache';

import { getDriver } from '../driver/index.js';
import { parsePageSrc, findPageWindowSize  } from './page-node.js';

const log = getLogger('driver:fetch-page');

type WindowSize = {
  width: number,
  height: number
};

type CachedData = {
  src?: string,
  screenshot?: string,
  nodes?: QAPageNode,
  windowRect?: WindowSize,
};

const _cache = new LRUCache<string, CachedData>({
  max: 100, // # of items to be stored
});

/**
 * fetch page data such as source, screenshot, window rect.
 * @param key 
 * @param options 
 * @returns 
 */
export async function fetchPage(key: string, options?: FetchPageOptions) {
  let page: CachedData | undefined = !options ? _cache.get(key) : undefined;
  if (options) {
    const { sessionId } = options;
    // updates flags for src, screenshot, window rect
    const updates = options.forceFetch ? [true, true, true] : [false, false, false];
    if (options.forceFetch) {
      if (!sessionId) {
        throw new Error('Invalid options: "sessionId" should be set when "forceFetch" is truthy');
      }
    } else if (sessionId) {
      page = _cache.get(key);
      if (!page) {
        updates[0] = !!options.src;
        updates[1] = !!options.screenshot;
        updates[2] = !!options.windowRect;
      } else {
        updates[0] = !!options.src && !page.src;
        updates[1] = !!options.screenshot && !page.screenshot;
        updates[2] = !!options.windowRect && !page.windowRect;
      }
    }
    let driver = undefined;
    let updateCache = false;
    if (sessionId) {
      driver = getDriver(sessionId);
      if (!driver) {
        throw new Error(`No Driver for specified session, ${sessionId}`);
      }
      if (!page) {
        page = {} as CachedData;
      }
      if (updates[0]) {
        page.src = await driver.getPageSource();
      }
      if (updates[1]) {
        page.screenshot = await driver.takeScreenshot();
      }
      if (updates[2]) {
        page.windowRect = await driver.getWindowRect();
      }
      updateCache = true;
    } else {
      page = _cache.get(key)
    }
    if (page && page.src && options.parsingOptions) {
      page.nodes = parsePageSrc(page.src, options.parsingOptions);
      if (!page.windowRect && page.nodes) {
        page.windowRect = findPageWindowSize(page.nodes);
      }
      updateCache = true;
    }
    if (updateCache) {
      _cache.set(key, page);
    }
  }

  return page;
}

/**
 * alias for forceful fetchPage()
 * @param key 
 * @param sessionId 
 * @returns 
 */
export async function refreshPage(key: string, sessionId: string) {
  return fetchPage(key, {
    forceFetch: true,
    sessionId,
    src: true,
    screenshot: true,
  });
}

/**
 * add or delete value in page cache.
 * if value is undefined the entry will be deleted.
 * @param key 
 * @param value 
 */
export function setPageCache(key: string, value: CachedData | undefined) {
  return _cache.set(key, value);
}

/**
 * get value in page cache.
 * @param key 
 */
export function getPageCache(key: string) {
  return _cache.get(key);
}

export async function findPageElement(sessionId: string, using: string, value: string) {
  try {
    const driver = getDriver(sessionId);
    if (!driver) {throw new Error('No Driver for specified session, ' + sessionId);}

    return await driver.findElement(using, value);
  } catch (error) {
    log(error);
    throw error;
  }
}