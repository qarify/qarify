import {
  configure,
  getConsoleSink,
  getLogger,
  getAnsiColorFormatter,
  configureSync,
  type Config,
  type Sink,
} from '@logtape/logtape';

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: [] }, // Suppresses all meta logs
    { category: ['app'], lowestLevel: 'trace', sinks: ['console'] },
  ],
});

//
// String
//

// no logs will be printed since not in any category
console.log('>>>>>>>> Not-in-category <<<<<<<<<<<<');
const d1 = getLogger(['not-in-category']);
d1.trace('trace');
d1.debug('debug');
d1.info('info');
d1.warn('warn');
d1.error('error');
d1.fatal('fatal');

console.log('\n>>>>>>>>>>>>>>>> app <<<<<<<<<<<<<<<<\n');
const d2 = getLogger(['app']);
d2.trace('trace');
d2.debug('debug');
d2.info('info');
d2.warn('warn');
d2.error('error');
d2.fatal('fatal');

console.log('\n>>>>>>>>>>>>>>>> app.test <<<<<<<<<<<<<<<<\n');
const d3 = getLogger(['app', 'test']);
d3.trace('trace');
d3.debug('debug');
d3.info('info');
d3.warn('warn');
d3.error('error');
d3.fatal('fatal');

//
// Object
//
console.log('\n>>>>>>>>>>>>>>>> app - object <<<<<<<<<<<<<<<<\n');
// It works as expected
const obj = { date: { a: 1, b: 2 }, msg: 'msg' };
d2.trace(obj);
d2.debug(obj);
d2.info(obj);
d2.warn(obj);
d2.error(obj);
d2.fatal(obj);

console.log('\n>>>>>>>>>>>>>>>> app - message with object <<<<<<<<<<<<<<<<\n');
// It does not work as expected - only message is logged, object is ignored
// But the object is saved if the logger is file logger
d2.trace('trace', obj);
d2.info('info', obj);
d2.warn('warn', obj);
d2.error('error', obj);
d2.fatal('fatal', obj);

console.log('\n>>>>>>>>>>>>>>>> app - object with message <<<<<<<<<<<<<<<<\n');
// It only logs object but does not log the message.
// And it also has type error.
// @ts-ignore
d2.trace(obj, 'trace');
// @ts-ignore
d2.info(obj, 'info');
// @ts-ignore
d2.warn(obj, 'warn');
// @ts-ignore
d2.error(obj, 'error');
// @ts-ignore
d2.fatal(obj, 'fatal');

//
// Error
//
console.log('\n>>>>>>>>>>>>>>>> app - error <<<<<<<<<<<<<<<<\n');
// It only logs the error message(error.message) but does not log the object.
d2.error(new Error('error'));
// It only logs 'hello' but does not log the error.
d2.error('hello', new Error('error'));
// It only logs the error message(error.message) but does not log the 'hello'.
// It also has a type error.
// @ts-ignore
d2.error(new Error('error'), 'hello');
