/**
 * `pscode status` — list changes under pscode/changes/ and their basic state.
 *
 * Deliberately lightweight: not a board, just a glance at what exists.
 */

import chalk from 'chalk';
import { configExists } from '../core/pscode-config.js';
import { listChanges, type ChangeState } from '../core/changes.js';

export interface StatusOptions {
  cwd?: string;
}

const STATE_COLOR: Record<ChangeState, (s: string) => string> = {
  draft: chalk.gray,
  'spec-review': chalk.yellow,
  ready: chalk.cyan,
  doing: chalk.blue,
  review: chalk.magenta,
  done: chalk.green,
};

export async function runStatus(opts: StatusOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();

  if (!configExists(projectRoot)) {
    console.log(chalk.yellow('No pscode/config.yaml found. Run `pscode init` first.'));
    process.exitCode = 1;
    return;
  }

  const changes = listChanges(projectRoot);
  if (changes.length === 0) {
    console.log(chalk.dim('\nNo changes yet. Start one with /ps:draft inside your agent.\n'));
    return;
  }

  console.log(chalk.bold('\nChanges\n'));
  for (const c of changes) {
    const color = STATE_COLOR[c.state] ?? chalk.white;
    const tasks = c.tasksTotal > 0 ? chalk.dim(`  (${c.tasksDone}/${c.tasksTotal} tasks)`) : '';
    console.log(`  ${color(c.state.padEnd(12))} ${c.slug}${tasks}`);
  }
  console.log();
}
