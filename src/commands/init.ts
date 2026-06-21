/**
 * `pscode init` — install the guided SDD workflow into the current project.
 */

import chalk from 'chalk';
import { AGENTS, getAgent } from '../core/config.js';
import { detectAgents } from '../core/detect.js';
import { buildConfig, configExists, writeConfig } from '../core/pscode-config.js';
import { emptyBoard, writeBoard } from '../core/board.js';
import { ensureProjectStructure, installAgent, installChangeTemplates } from '../core/installer.js';
import { syncInstructionFiles } from '../core/agents-md.js';
import { isInteractive } from '../core/interactive.js';

export interface InitOptions {
  agents?: string[];
  board?: boolean;
  yes?: boolean;
  cwd?: string;
}

/** Resolve which agents to install for, prompting when appropriate. */
async function resolveAgents(
  projectRoot: string,
  opts: InitOptions,
  interactive: boolean
): Promise<string[]> {
  if (opts.agents && opts.agents.length > 0) {
    const unknown = opts.agents.filter((id) => !getAgent(id));
    if (unknown.length > 0) {
      throw new Error(
        `Unknown agent(s): ${unknown.join(', ')}. Valid: ${AGENTS.map((a) => a.id).join(', ')}`
      );
    }
    return opts.agents;
  }

  const detected = detectAgents(projectRoot).map((a) => a.id);

  if (!interactive) {
    return detected.length > 0 ? detected : ['claude'];
  }

  const { checkbox } = await import('@inquirer/prompts');
  const selected = await checkbox<string>({
    message: 'Which coding agents should PSCode install into?',
    choices: AGENTS.map((a) => ({
      name: a.name,
      value: a.id,
      checked: detected.includes(a.id),
    })),
  });
  return selected.length > 0 ? selected : ['claude'];
}

/** Resolve whether to create the local board, prompting when appropriate. */
async function resolveBoard(opts: InitOptions, interactive: boolean): Promise<boolean> {
  // `--no-board` is an explicit opt-out; respect it without prompting.
  if (opts.board === false) return false;
  if (!interactive) return opts.board ?? true;

  const { confirm } = await import('@inquirer/prompts');
  return confirm({ message: 'Create a local board (pscode/board.yaml)?', default: true });
}

export async function runInit(opts: InitOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();
  const reinit = configExists(projectRoot);
  const interactive = isInteractive() && !opts.yes;

  const agents = await resolveAgents(projectRoot, opts, interactive);
  const board = await resolveBoard(opts, interactive);

  ensureProjectStructure(projectRoot);
  writeConfig(projectRoot, buildConfig({ agents, board }));
  if (board) writeBoard(projectRoot, emptyBoard());
  installChangeTemplates(projectRoot);
  for (const agentId of agents) installAgent(projectRoot, agentId);
  const instructionFiles = syncInstructionFiles(projectRoot);

  printSummary({ reinit, agents, board, instructionFiles });
}

function printSummary(info: {
  reinit: boolean;
  agents: string[];
  board: boolean;
  instructionFiles: string[];
}): void {
  const title = info.reinit ? 'PSCode re-initialized' : 'PSCode initialized';
  console.log(chalk.green(`\n✓ ${title}\n`));
  console.log(`  ${chalk.bold('Agents:')}  ${info.agents.map((a) => getAgent(a)?.name ?? a).join(', ')}`);
  console.log(`  ${chalk.bold('Board:')}   ${info.board ? 'enabled (pscode/board.yaml)' : 'disabled'}`);
  console.log(`  ${chalk.bold('Config:')}  pscode/config.yaml`);
  console.log(`  ${chalk.bold('Docs:')}    ${info.instructionFiles.join(', ')}`);
  console.log(chalk.dim('\nStart a change inside your agent:'));
  console.log(chalk.cyan('  /ps:do "describe what you want to build"\n'));
}
