/**
 * CLI Main
 */
import { Command } from 'commander';

import { run } from './run.js';

// const pac = await import('../package.json');

const program = new Command();

program
  .name('qarify')
  .description('QArify CLI')
  .version('1.0.0');

program
  .option('-c, --config <path>', 'config file path')
  .option('--cacheDir <path>', 'cache directory')
  .option('--framework <framework>', 'test framework')
  .option('--tsconfig <path>', 'tsconfig path')
  .option('--forceBuild', 'whether to force build spec files');

program.parse();

await run(program.opts(), process.cwd());
