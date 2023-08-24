/**
 * CLI Main
 */
import { Command } from 'commander';

import { qarify } from './qarify.js';

// const pac = await import('../package.json');

const program = new Command();

program
  .name('qarify')
  .description('QArify CLI')
  .version('1.0.0');

program
  .option('-c, --config [path]', 'config file path')
  .option('--cacheDir [path]', 'cache directory')
  .option('--framework [framework]', 'test framework')
  .option('--tsconfig [path]', 'tsconfig path')
  .option('--forceBuild', 'whether to force build spec files')
  .option('--logLevel [debug|info|error|silence]', 'log level (default: info)', 'info')
  .option('--forceFork', 'run on a forked process');

program.parse();

await qarify(program.opts(), process.cwd());
