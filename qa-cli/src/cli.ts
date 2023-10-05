/**
 * CLI Main
 */
import { Command } from 'commander';

import { qarify } from './qarify.js';
import { initConfig } from './init-config.js';

export type CLIInitOptions = {
  overwrite?: boolean;
}
// const pac = await import('../package.json');

const program = new Command();

program
  .name('qarify')
  .description('QArify CLI')
  .version('0.9.0');

program.command('run', { isDefault: true })
  .description('Run spec files')
  .option('-c, --config [path]', 'config file path')
  .option('--cacheDir [path]', 'cache directory')
  .option('--framework [mocha-bdd|mocha-tdd|mocha-qunit|mocha-exports|normal-script]', 'test framework')
  .option('--tsconfig [path]', 'tsconfig path')
  .option('--forceBuild', 'whether to force build spec files')
  .option('--logLevel [debug|info|error|silence]', 'log level', 'error')
  .option('--ci', 'whether to run in ci-mode')
  .option('--ignoreNoFiles', 'whether to ignore no spec files to run')
  .option('--forceFork', 'run on a forked process')
  .action((options) => {
    qarify(options, process.cwd()).then(() => {}).catch((e) => {console.error(e);});
  });

program.command('init')
  .description('Initialize QArify')
  .option('--overwrite', 'overwrite the existing config')
  .action((opts) => {
    initConfig(opts, process.cwd()).then(() => {}).catch((e) => {console.error(e);});
  });

program.parse(process.argv);
