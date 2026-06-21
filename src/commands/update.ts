/**
 * `pscode update` — refresh PSCode-controlled files in place.
 *
 * Only files PSCode owns are rewritten: slash commands, skills, the change
 * templates, the managed AGENTS.md/CLAUDE.md block, and the config version.
 * User content — changes, board cards, custom instructions — is preserved.
 */

import chalk from 'chalk';
import { PSCODE_VERSION } from '../core/config.js';
import { buildConfig, readConfig, writeConfig } from '../core/pscode-config.js';
import { detectAgents } from '../core/detect.js';
import { isAgentInstalled, installAgent, installChangeTemplates } from '../core/installer.js';
import { syncInstructionFiles } from '../core/agents-md.js';

export interface UpdateOptions {
  cwd?: string;
}

export async function runUpdate(opts: UpdateOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();
  const config = readConfig(projectRoot);

  if (!config) {
    console.log(chalk.yellow('No pscode/config.yaml found. Run `pscode init` first.'));
    process.exitCode = 1;
    return;
  }

  // Update the agents recorded in config, plus any newly-detected ones that
  // already have PSCode files on disk.
  const fromConfig = config.agents;
  const detected = detectAgents(projectRoot)
    .map((a) => a.id)
    .filter((id) => isAgentInstalled(projectRoot, id));
  const agents = Array.from(new Set([...fromConfig, ...detected]));

  for (const agentId of agents) installAgent(projectRoot, agentId);
  installChangeTemplates(projectRoot);
  const instructionFiles = syncInstructionFiles(projectRoot);

  // Refresh the version (and recorded agents) without touching board settings.
  writeConfig(
    projectRoot,
    buildConfig({ agents, board: config.board.enabled, profile: config.profile })
  );

  console.log(chalk.green(`\n✓ PSCode updated to v${PSCODE_VERSION}\n`));
  console.log(`  ${chalk.bold('Agents:')} ${agents.join(', ') || '(none)'}`);
  console.log(`  ${chalk.bold('Docs:')}   ${instructionFiles.join(', ')}\n`);
}
