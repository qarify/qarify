import {type SpawnOptions, type ChildProcess, spawn} from 'node:child_process';

export type ProcessPromise = Promise<NodeJS.Signals | number> & {
  process: ChildProcess;
}

export function execAsync(
  file: string, args: ReadonlyArray<string>, options: SpawnOptions
): ProcessPromise {
  const proc = spawn(file, args, options);
  const promise = new Promise<NodeJS.Signals | number>((resolve, reject,) => {
    proc.on('exit', (code, signal) => {
      if (code || signal) {
        reject(code || signal);
      } else {
        resolve(code || 0);
      }
    });
  }) as ProcessPromise;
  promise.process = proc;
  return promise;
}
