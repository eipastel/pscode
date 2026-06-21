/**
 * `pscode doctor` — verify the project is correctly configured.
 *
 * Checks config, structure, board, and that each recorded agent has its
 * commands and skills installed at the current version. Exits non-zero when
 * something is missing or stale.
 */

import chalk from 'chalk';
import { PSCODE_VERSION, getAgent } from '../core/config.js';
import { configExists, readConfig } from '../core/pscode-config.js';
import { boardExists } from '../core/board.js';
import { changesDir } from '../core/changes.js';
import { agentArtifactStatus, installedVersion } from '../core/installer.js';
import { hasManagedBlock } from '../core/agents-md.js';
import { exists } from '../core/fs-utils.js';

export interface DoctorOptions {
  cwd?: string;
}

interface Check {
  ok: boolean;
  label: string;
  detail?: string;
}

export function collectChecks(projectRoot: string): Check[] {
  const checks: Check[] = [];

  const hasConfig = configExists(projectRoot);
  checks.push({ ok: hasConfig, label: 'pscode/config.yaml exists' });
  if (!hasConfig) return checks;

  const config = readConfig(projectRoot);
  if (!config) {
    checks.push({ ok: false, label: 'pscode/config.yaml is valid' });
    return checks;
  }

  checks.push({ ok: exists(changesDir(projectRoot)), label: 'pscode/changes/ exists' });
  checks.push({
    ok: hasManagedBlock(projectRoot),
    label: 'AGENTS.md has the PSCode block',
  });

  if (config.board.enabled) {
    checks.push({ ok: boardExists(projectRoot), label: 'pscode/board.yaml exists (board enabled)' });
  }

  if (config.agents.length === 0) {
    checks.push({ ok: false, label: 'at least one agent configured' });
  }

  for (const agentId of config.agents) {
    const name = getAgent(agentId)?.name ?? agentId;
    const { present, total } = agentArtifactStatus(projectRoot, agentId);
    const filesOk = present === total;
    checks.push({
      ok: filesOk,
      label: `${name}: commands & skills installed`,
      detail: filesOk ? undefined : `${present}/${total} files present`,
    });

    const version = installedVersion(projectRoot, agentId);
    const versionOk = version === PSCODE_VERSION;
    checks.push({
      ok: versionOk,
      label: `${name}: up to date`,
      detail: versionOk ? undefined : `installed ${version ?? 'unknown'}, current ${PSCODE_VERSION}`,
    });
  }

  return checks;
}

export async function runDoctor(opts: DoctorOptions = {}): Promise<void> {
  const projectRoot = opts.cwd ?? process.cwd();
  const checks = collectChecks(projectRoot);
  const allOk = checks.every((c) => c.ok);

  console.log(chalk.bold('\nPSCode doctor\n'));
  for (const c of checks) {
    const mark = c.ok ? chalk.green('✓') : chalk.red('✗');
    const detail = c.detail ? chalk.dim(` (${c.detail})`) : '';
    console.log(`  ${mark} ${c.label}${detail}`);
  }

  if (allOk) {
    console.log(chalk.green('\nEverything looks good.\n'));
  } else {
    console.log(chalk.yellow('\nIssues found. Run `pscode update` or `pscode init` to fix.\n'));
    process.exitCode = 1;
  }
}
