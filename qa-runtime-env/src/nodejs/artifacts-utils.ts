import fs from 'node:fs';
import path from "node:path";
import type { QAConfig } from "@qarify/types";
import { getLogger } from '@qarify/logger';

const log = getLogger('nodejs:artifacts-utils');

const _testId2Name = (testId: string) => testId.replace(/ /g, '_');
const _layoutBaseDir = (config: QAConfig) => path.join(config.cacheDir, '.layout');
const _layoutFilePath = (config: QAConfig, id: string) => path.join(_layoutBaseDir(config), _testId2Name(id) + '.json');

/**
 * load layout from a file
 * @param config 
 * @param id 
 * @returns content string if the layout file exists, `undefined` if error.
 */
export function readPageLayout(config: QAConfig, id: string) {
  return new Promise<string|undefined>((resolve) => {
    try {
      const filePath = _layoutFilePath(config, id);
      log('>>> read page layout from', filePath);
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          log(err);
          resolve(undefined);
        }
        resolve(data);
      });
    } catch (e) {
      log(e);
      resolve(undefined);
    }
  });
}

/**
 * save layout to a file
 * @param config 
 * @param id 
 * @param data 
 * @returns 
 */
export function savePageLayout(config: QAConfig, id: string, data: any) {
  return new Promise<string>((resolve, reject) => {
    const baseDir = _layoutBaseDir(config);
    const filePath = _layoutFilePath(config, id);
    if (!fs.existsSync(baseDir)) {
      fs.mkdir(baseDir, { recursive: true }, (err) => {
        if (err) {
          log(err);
          reject(err);
        }
        _savePageLayout(filePath, data, resolve, reject);
      })
    } else {
      _savePageLayout(filePath, data, resolve, reject);
    }
  });
}
function _savePageLayout(filePath: string, data: any, resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: any) => void) {
  log('>>> save page layout to', filePath);
  fs.writeFile(filePath, JSON.stringify(data), 'utf-8', (err) => {
    if (err) {
      log(err);
      reject(err);
    }
    resolve(filePath);
  });
}

/**
 * remove .layout
 * @param config 
 * @returns 
 */
export function cleanPageLayout(config: QAConfig) {
  return new Promise<boolean>((resolve) => {
    const baseDir = _layoutBaseDir(config);
    if (fs.existsSync(baseDir)) {
      fs.rm(baseDir, { recursive: true }, (err) => {
        resolve(!err);
      });
    } else {
      resolve(true);
    }
  });
}