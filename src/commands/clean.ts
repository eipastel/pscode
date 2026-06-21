/**
 * `pscode clean` — remove PSCode-generated files.
 *
 * By default removes the rails (agent commands/skills, change templates, the
 * managed instruction block) but preserves the user's changes and config.
 * `--all` additionally removes the whole `pscode/` directory. Destructive
 * actions require confirmation (`--yes`, or an interactive prompt).
 */

import path from 'path';
import chalk from 'chalk';
import { AGENTS } from '../core/config.js';
import { readConfig } from '../core/pscode-config.js';
import { isAgentInstalled, removeAgent, removePscodeDir } from '../core/installer.js';
import { removeManagedBlock } from '../core/agents-md.js';
import { removeDir } from '../core/fs-utils.js';
import { PSCODE_DIR } from '../core/config.js';
import { isInteractive } from '../core/interactive.js';

export interface CleanOptions {
  all?: boolean;
  yes?: boolean;
  cwd?: string;
}

export async function runClean(opts: CleanOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();
  const config = readConfig(projectRoot);

  // Agents to clean: those in config plus any with files on disk.
  const candidateAgents = new Set<string>(config?.agents ?? []);
  for (const a of AGENTS) {
    if (isAgentInstalled(projectRoot, a.id)) candidateAgents.add(a.id);
  }
  const agents = [...candidateAgents];

  const summary = opts.all
    ? 'remove all PSCode files INCLUDING pscode/ (your changes will be deleted)'
    : 'remove PSCode rails (commands, skills, templates, instruction block); your changes are kept';

  if (!(await confirm(summary, opts))) {
    console.log(chalk.dim('Aborted. Nothing was removed.'));
    return;
  }

  const removed: string[] = [];
  for (const agentId of agents) removed.push(...removeAgent(projectRoot, agentId));

  const docsTouched = removeManagedBlock(projectRoot);
  for (const f of docsTouched) removed.push(`${f} (PSCode block)`);

  if (opts.all) {
    if (removePscodeDir(projectRoot)) removed.push(`${PSCODE_DIR}/`);
  } else {
    if (removeDir(path.join(projectRoot, PSCODE_DIR, 'templates'))) {
      removed.push(`${PSCODE_DIR}/templates/`);
    }
  }

  if (removed.length === 0) {
    console.log(chalk.yellow('Nothing to clean.'));
    return;
  }
  console.log(chalk.green(`\n✓ Removed ${removed.length} item(s):\n`));
  for (const r of removed) console.log(`  - ${r}`);
  console.log();
}

async function confirm(summary: string, opts: CleanOptions): Promise<boolean> {
  if (opts.yes) return true;
  if (!isInteractive()) {
    console.log(
      chalk.yellow(`This will ${summary}.\nRe-run with --yes to confirm (non-interactive).`)
    );
    return false;
  }
  const { confirm: confirmPrompt } = await import('@inquirer/prompts');
  return confirmPrompt({ message: `This will ${summary}. Continue?`, default: false });
}
