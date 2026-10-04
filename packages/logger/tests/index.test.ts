import { expect, test, describe, afterEach, beforeEach, type Mock } from 'bun:test';
import getLogger from '../index';
import { dispose } from '@logtape/logtape';

describe('Logger:', () => {
  afterEach(async () => {
    await dispose(); // Clean up configuration between test blocks
  });

  test('should create default logger', () => {
    const logger = getLogger();
    expect(logger.category).toEqual(['qy']);
    // same instance
    const logger2 = getLogger();
    expect(logger).toBe(logger2);
  });

  test('should print messages', () => {
    const logger = getLogger();
    logger.trace('trace {*}', { id: '99' });
    logger.debug('debug {*}', { id: '99' });
    logger.info('info {id}', { id: '99' });
    logger.warn('warn {id}', { id: '99' });
    logger.error('error {id}', { id: '99' });
  });

  test('should print messages with', () => {
    const logger = getLogger().with({ name: 'logger' });
    logger.info('[{name}] info');

    const logger2 = getLogger().with({ name: 'logger' });
    expect(logger).toEqual(logger2);
  });
});
