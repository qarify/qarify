import {spawn} from 'child_process';

/** @typedef {Promise<NodeJS.Signals | number> & { process: import('child_process').ChildProcess}} ProcessPromise */
/** @typedef {import('child_process').SpawnOptions} ExecAsyncOptions */
/**
 * @param {string} file 
 * @param {ReadonlyArray<string>} args 
 * @param {ExecAsyncOptions} options 
 * @returns {ProcessPromise}
 */
export function execAsync(
  file, args, options
) {
  const proc = spawn(file, args, options);
  const promise = /** @type {ProcessPromise} */ (new Promise((resolve, reject,) => {
    proc.on('exit', (code, signal) => {
      if (code || signal) {
        reject(code || signal);
      } else {
        resolve(code || 0);
      }
    });
  }));
  promise.process = proc;
  return promise;
}
