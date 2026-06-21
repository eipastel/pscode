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
import { ensureProjectStructure, installAgent, installChangeTemplates } from '../core/installer.js';
import { syncInstructionFiles } from '../core/agents-md.js';
import { enableBypassPermissions } from '../core/claude-settings.js';
import { openTarget, launchCommandFor, canHandOffTerminal, launchAgent } from '../core/launch.js';
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
  lang?: string;
  yes?: boolean;
  /**
   * Enable Claude Code's `bypassPermissions` mode in `.claude/settings.json`.
   * Tri-state: `undefined` defers to the wizard (default yes), `true`/`false`
   * force it from a CLI flag. Only applies when Claude Code is selected.
   */
  bypassPermissions?: boolean;
  /**
   * Open the selected agent's CLI after install (Claude Code preferred).
   * Tri-state: `undefined` defers to the wizard (default yes), `true`/`false`
   * force it from a CLI flag. The launch only runs when a terminal is present.
   */
  open?: boolean;
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
  // Only Claude Code and Codex are offered in the wizard; other agents stay
  // reachable via the `--agent` flag and detection. Claude Code is the
  // recommended default baseline; detected agents are pre-checked too.
  // The same `description` on every choice pins the hint as a constant footer
  // (it never changes on selection); `instructions: false` drops the top tip
  // that otherwise vanishes after the first keypress.
  const offered = AGENTS.filter((a) => a.id === 'claude' || a.id === 'codex');
  return checkbox<string>({
    message: t.selectAgents,
    instructions: false,
    choices: offered.map((a) => ({
      name: a.id === 'claude' ? `${a.name} ${t.recommendedSuffix}` : a.name,
      value: a.id,
      checked: a.id === 'claude' || detected.includes(a.id),
      description: t.agentsHint,
    })),
    validate: (items) => items.length > 0 || t.atLeastOneAgent,
  });
}

/**
 * Resolve whether to enable Claude Code's bypassPermissions mode. Only relevant
 * when Claude Code is selected — the other agents don't read `.claude/settings.json`.
 */
async function resolveBypassPermissions(
  opts: InitOptions,
  agents: string[],
  interactive: boolean,
  t: InitMessages
): Promise<boolean> {
  if (!agents.includes('claude')) return false;
  if (opts.bypassPermissions !== undefined) return opts.bypassPermissions;
  if (!interactive) return true;

  const { instantConfirm } = await import('../core/prompts.js');
  return instantConfirm({ message: t.bypassPermissionsPrompt, default: true });
}

/**
 * Resolve which agent (if any) to open after install. Prioritizes Claude Code;
 * returns null when the user opts out or no selected agent is launchable.
 */
async function resolveOpen(
  opts: InitOptions,
  agents: string[],
  interactive: boolean,
  t: InitMessages
): Promise<string | null> {
  const target = openTarget(agents);
  if (!target) return null;

  let shouldOpen: boolean;
  if (opts.open !== undefined) {
    shouldOpen = opts.open;
  } else if (interactive) {
    const { instantConfirm } = await import('../core/prompts.js');
    const name = getAgent(target)?.name ?? target;
    shouldOpen = await instantConfirm({ message: t.openAgentPrompt(name), default: true });
  } else {
    shouldOpen = true; // non-interactive (--yes): open as well
  }
  return shouldOpen ? target : null;
}

export async function runInit(opts: InitOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();
  const reinit = configExists(projectRoot);
  const interactive = isInteractive() && !opts.yes;

  const language = await resolveLanguage(opts, interactive);
  const t = getMessages(language);

  const agents = await resolveAgents(projectRoot, opts, interactive, t);
  const bypassPermissions = await resolveBypassPermissions(opts, agents, interactive, t);
  const openAgent = await resolveOpen(opts, agents, interactive, t);

  ensureProjectStructure(projectRoot);
  writeConfig(projectRoot, buildConfig({ agents }));
  installChangeTemplates(projectRoot);
  for (const agentId of agents) installAgent(projectRoot, agentId);
  const instructionFiles = syncInstructionFiles(projectRoot, agents);
  const settingsFile = bypassPermissions ? enableBypassPermissions(projectRoot) : undefined;

  printSummary({ reinit, agents, instructionFiles, settingsFile, t });

  if (openAgent) openOrHint(openAgent, projectRoot, t);
}

/**
 * Hand the terminal off to the agent's CLI when one is available; otherwise
 * (CI, piped runs) print how to start it so the choice isn't silently lost.
 */
function openOrHint(agentId: string, projectRoot: string, t: InitMessages): void {
  if (canHandOffTerminal()) {
    launchAgent(agentId, projectRoot);
    return;
  }
  const command = launchCommandFor(agentId);
  if (command) console.log(chalk.dim(t.openHint(command)));
}

function printSummary(info: {
  reinit: boolean;
  agents: string[];
  instructionFiles: string[];
  settingsFile?: string;
  t: InitMessages;
}): void {
  const { t } = info;
  const title = info.reinit ? t.reinitialized : t.initialized;
  console.log(chalk.green(`\n✓ ${title}\n`));
  console.log(`  ${chalk.bold(t.agentsLabel)}  ${info.agents.map((a) => getAgent(a)?.name ?? a).join(', ')}`);
  console.log(`  ${chalk.bold(t.configLabel)}  pscode/config.yaml`);
  console.log(`  ${chalk.bold(t.docsLabel)}    ${info.instructionFiles.join(', ')}`);
  if (info.settingsFile) {
    console.log(`  ${chalk.bold(t.settingsLabel)} ${info.settingsFile} (bypassPermissions)`);
  }
  console.log(chalk.dim(`\n${t.nextStepHint}`));
  console.log(chalk.cyan(`  /ps:draft "${t.nextStepExample}"\n`));
}
