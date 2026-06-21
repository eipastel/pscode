/**
 * `pscode init` — install the guided SDD workflow into the current project.
 *
 * The wizard is localized (see `core/i18n.ts`): the selected language only
 * affects init's prompts and summary, never the installed content.
 */

import chalk from 'chalk';
import { AGENTS, getAgent } from '../core/config.js';
import { detectAgents } from '../core/detect.js';
import { buildConfig, configExists, writeConfig } from '../core/pscode-config.js';
import { emptyBoard, writeBoard } from '../core/board.js';
import { ensureProjectStructure, installAgent, installChangeTemplates } from '../core/installer.js';
import { syncInstructionFiles } from '../core/agents-md.js';
import { isInteractive } from '../core/interactive.js';
import {
  LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
  getMessages,
  type InitMessages,
} from '../core/i18n.js';

export interface InitOptions {
  agents?: string[];
  board?: boolean;
  lang?: string;
  yes?: boolean;
  cwd?: string;
}

/** Resolve the wizard language (first step). */
async function resolveLanguage(opts: InitOptions, interactive: boolean): Promise<string> {
  if (opts.lang) {
    if (!isSupportedLocale(opts.lang)) {
      throw new Error(
        `Unknown language: ${opts.lang}. Valid: ${LOCALES.map((l) => l.id).join(', ')}`
      );
    }
    return opts.lang;
  }
  if (!interactive) return DEFAULT_LOCALE;

  const { select } = await import('@inquirer/prompts');
  return select({
    message: 'Select language',
    choices: LOCALES.map((l) => ({ name: l.name, value: l.id })),
    default: DEFAULT_LOCALE,
  });
}

/** Resolve which agents to install for, prompting when appropriate. */
async function resolveAgents(
  projectRoot: string,
  opts: InitOptions,
  interactive: boolean,
  t: InitMessages
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
  // Claude Code is the default baseline; detected agents are pre-checked too.
  return checkbox<string>({
    message: t.selectAgents,
    choices: AGENTS.map((a) => ({
      name: a.name,
      value: a.id,
      checked: a.id === 'claude' || detected.includes(a.id),
    })),
    validate: (items) => items.length > 0 || t.atLeastOneAgent,
  });
}

/** Resolve whether to create the local board, prompting when appropriate. */
async function resolveBoard(
  opts: InitOptions,
  interactive: boolean,
  t: InitMessages
): Promise<boolean> {
  // `--no-board` is an explicit opt-out; respect it without prompting.
  if (opts.board === false) return false;
  if (!interactive) return opts.board ?? true;

  const { confirm } = await import('@inquirer/prompts');
  return confirm({ message: t.createBoard, default: true });
}

export async function runInit(opts: InitOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();
  const reinit = configExists(projectRoot);
  const interactive = isInteractive() && !opts.yes;

  const language = await resolveLanguage(opts, interactive);
  const t = getMessages(language);

  const agents = await resolveAgents(projectRoot, opts, interactive, t);
  const board = await resolveBoard(opts, interactive, t);

  ensureProjectStructure(projectRoot);
  writeConfig(projectRoot, buildConfig({ agents, board }));
  if (board) writeBoard(projectRoot, emptyBoard());
  installChangeTemplates(projectRoot);
  for (const agentId of agents) installAgent(projectRoot, agentId);
  const instructionFiles = syncInstructionFiles(projectRoot);

  printSummary({ reinit, agents, board, instructionFiles, t });
}

function printSummary(info: {
  reinit: boolean;
  agents: string[];
  board: boolean;
  instructionFiles: string[];
  t: InitMessages;
}): void {
  const { t } = info;
  const title = info.reinit ? t.reinitialized : t.initialized;
  console.log(chalk.green(`\n✓ ${title}\n`));
  console.log(`  ${chalk.bold(t.agentsLabel)}  ${info.agents.map((a) => getAgent(a)?.name ?? a).join(', ')}`);
  console.log(`  ${chalk.bold(t.boardLabel)}   ${info.board ? t.boardEnabled : t.boardDisabled}`);
  console.log(`  ${chalk.bold(t.configLabel)}  pscode/config.yaml`);
  console.log(`  ${chalk.bold(t.docsLabel)}    ${info.instructionFiles.join(', ')}`);
  console.log(chalk.dim(`\n${t.nextStepHint}`));
  console.log(chalk.cyan(`  /ps:do "${t.nextStepExample}"\n`));
}
