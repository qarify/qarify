import { getLogger } from '@qarify/logger';
import type { QAPageNode, QAPageRefreshOptions, PageParserOptions } from '@qarify/types';

import { getDriver } from '../driver/index.js';
import { parsePageSrc  } from './page-node.js';

const log = getLogger('driver:page');

type WindowRectReturn = {
  x: number,
  y: number,
  width: number,
  height: number
};

let _pageSrc = '';
let _pageNode: QAPageNode | undefined = undefined;
let _screenshot = '';
let _windowRect = {} as WindowRectReturn;

export async function getPageSource(
  updateSessionId?: string,
) {
  if (updateSessionId) { 
    try {
      const driver = getDriver(updateSessionId);
      if (!driver) {throw new Error('No Driver for specified session, ' + updateSessionId);}

      _pageSrc = await driver.getPageSource();
    } catch (error) {
      log(error);
      throw error;
    }
  }
  return _pageSrc;  
}

export async function getPageNode(
  updateSessionId?: string,
  onlyUpdateNoCache = false,
  options: PageParserOptions = {},
) {
  if (updateSessionId) { 
    if (!onlyUpdateNoCache || (onlyUpdateNoCache && !_pageNode)) {
      await getPageSource(updateSessionId);
      _pageNode = parsePageSrc(_pageSrc, options);
    }
  }
  return _pageNode;
}

export function getPageNodeSync() {
  return _pageNode;
}

export async function getPageScreenshot(
  updateSessionId?: string,
) {
  if (updateSessionId) {
    try {
      const driver = getDriver(updateSessionId);
      if (!driver) {throw new Error('No Driver for specified session, ' + updateSessionId);}

      _screenshot = await driver.takeScreenshot();
    } catch (error) {
      log(error);
      throw error;
    }
  }
  return _screenshot;
}

export async function refreshPage(sessionId: string, options: QAPageRefreshOptions) {
  if (options.parsing) {
    await getPageNode(sessionId);
  } else {
    await getPageSource(sessionId);
  }
  if (options.screenshot) {
    await getPageScreenshot(sessionId);
  }
  return {
    source: _pageSrc,
    node: _pageNode,
    screenshot: _screenshot,
  };
}

export async function getPageWindowRect(
  updateSessionId?: string,
) {
  if (updateSessionId) {
    try {
      const driver = getDriver(updateSessionId);
      if (!driver) {throw new Error('No Driver for specified session, ' + updateSessionId);}

      _windowRect = await driver.getWindowRect();
    } catch (error) {
      log(error);
      throw error;
    }
  }
  return _windowRect;
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