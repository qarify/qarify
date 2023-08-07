/**
 * CLI Main
 */
import { Command } from 'commander';

import { run } from './compose-spec.mjs';

// const pac = await import('../package.json');

export type CLIOptions = {
  config: string;
  project: string;
};

const program = new Command();

program
  .name('qarify')
  .description('QArify CLI')
  .version('1.0.0');

program
  .option('-c, --config <path>', 'config file path', 'qarify.json')
  .option('-p, --project <name>', 'project name, "*" for all projects', '*');

program.parse();

await run(program.opts(), process.cwd());
