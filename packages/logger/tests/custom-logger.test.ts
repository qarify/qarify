import { expect, test, describe, afterEach, beforeEach, type Mock } from 'bun:test';
import getLogger, { getCustomLogger } from '../index';
import { dispose, withContext } from '@logtape/logtape';
import { getSessionFileSink, SessionLogger } from './file-logger';
import path from 'node:path';
import fs from 'node:fs';

describe('Logger: custom', () => {
  const logDir = path.join(import.meta.dir, '..', 'node_modules', '_output');
  const testSessions = ['test1', 'test2'];

  beforeEach(async () => {
    testSessions.forEach((sessionId) => {
      const logFile = path.join(logDir, `session-${sessionId}.log`);
      try {
        fs.unlinkSync(logFile);
      } catch {}
    });
  });

  afterEach(async () => {
    await dispose(); // Clean up configuration between test blocks
    await SessionLogger.closeAll();
  });

  test('should use cached custom logger', async () => {
    const logger = await getCustomLogger({
      names: ['file'],
      sinkName: 'file',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    const logger2 = getLogger(['file']);
    expect(logger).toBe(logger2);
  });

  test('should reconfigure with same logger', async () => {
    const logger1 = await getCustomLogger({
      names: ['file'],
      sinkName: 'file',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    const logger2 = await getCustomLogger({
      names: ['file'],
      sinkName: 'file',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    const logger3 = await getCustomLogger({
      names: ['file'],
      sinkName: 'file',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    withContext({ sessionId: 'test1' }, () => {
      logger1.info('test debug 1');
      logger2.info('test debug 2');
      logger3.info('test debug 3');
    });
    expect(fs.readFileSync(path.join(logDir, 'session-test1.log'), 'utf-8')).toContain('test debug 1');
    expect(fs.readFileSync(path.join(logDir, 'session-test1.log'), 'utf-8')).toContain('test debug 2');
    expect(fs.readFileSync(path.join(logDir, 'session-test1.log'), 'utf-8')).toContain('test debug 3');
  });

  test('should reconfigure multiple times with different sinks', async () => {
    const logger1 = await getCustomLogger({
      names: ['file1'],
      sinkName: 'file1',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    const logger2 = await getCustomLogger({
      names: ['file2'],
      sinkName: 'file2',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    const logger3 = await getCustomLogger({
      names: ['file3'],
      sinkName: 'file3',
      sink: getSessionFileSink(logDir, true),
      isFileSink: true,
    });
    withContext({ sessionId: 'test1' }, () => {
      logger1.info('test debug 1');
      logger2.info('test debug 2');
      logger3.info('test debug 3');
    });
    expect(fs.readFileSync(path.join(logDir, 'session-test1.log'), 'utf-8')).toContain('test debug 1');
    expect(fs.readFileSync(path.join(logDir, 'session-test1.log'), 'utf-8')).toContain('test debug 2');
    expect(fs.readFileSync(path.join(logDir, 'session-test1.log'), 'utf-8')).toContain('test debug 3');
  });
});
