import { expect, test, describe, afterEach, beforeEach } from 'bun:test';
import { dispose, type Logger } from '@logtape/logtape';
import { DynamicLogFileManager } from '../lib/dynamic-log-file-manager';
import fs from 'node:fs';
import path from 'node:path';

describe('Logger: dynamic file', () => {
  let logger: Logger;
  const logKey = 'sessionId';
  const logDir = path.join(import.meta.dir, '..', 'node_modules', '_output');
  const logFile = path.join(logDir, 'test.log');

  beforeEach(async () => {
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
    // set env for dynamic file logger
    process.env.LOG_DYNAMIC_FILE_KEY = logKey;
    const { default: getLogger } = await import('../index');
    logger = getLogger(['qy-dynamic']);
  });

  afterEach(async () => {
    await dispose(); // Clean up configuration between test blocks
  });

  test('dynamic sync log file', async () => {
    DynamicLogFileManager.open('test1', logFile, true);
    const _logger = logger.with({ [logKey]: 'test1' });
    _logger.info('test debug 1', { [logKey]: 'test1' });
    await DynamicLogFileManager.close('test1');

    expect(fs.readFileSync(logFile, 'utf-8')).toContain(JSON.stringify({ [logKey]: 'test1' }));
  });

  test('dynamic async log file', async () => {
    DynamicLogFileManager.open('test2', logFile);
    const _logger = logger.with({ [logKey]: 'test2' });
    _logger.info('test debug 1', { [logKey]: 'test2' });
    await DynamicLogFileManager.close('test2');

    expect(fs.readFileSync(logFile, 'utf-8')).toContain(JSON.stringify({ [logKey]: 'test2' }));
  });
});
