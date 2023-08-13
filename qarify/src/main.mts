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
  .option('-p, --project <name>', 'project name, "*" for all projects', '*');

program.parse();

await run(program.opts(), process.cwd());
