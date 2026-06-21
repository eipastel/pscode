/**
 * `pscode doctor` — verify the project is correctly configured.
 *
 * Checks config, structure, and that each recorded agent has its commands and
 * skills installed at the current version. Exits non-zero when something is
 * missing or stale.
 */

import chalk from 'chalk';
import { PSCODE_VERSION, getAgent, instructionFilesFor } from '../core/config.js';
import { configExists, readConfig } from '../core/pscode-config.js';
import { changesDir } from '../core/changes.js';
import { agentArtifactStatus, installedVersion } from '../core/installer.js';
import { hasManagedBlock } from '../core/agents-md.js';
import { exists } from '../core/fs-utils.js';
import { collectPreflight } from '../core/preflight.js';

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
  const instructionFiles = instructionFilesFor(config.agents);
  checks.push({
    ok: hasManagedBlock(projectRoot, config.agents),
    label: `${instructionFiles.join(', ')} ${instructionFiles.length > 1 ? 'have' : 'has'} the PSCode block`,
  });

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

  // Environment preflight — informational; an optional integration being
  // unconfigured does not fail `doctor`.
  const config = readConfig(projectRoot);
  const env = collectPreflight(projectRoot, { agents: config?.agents ?? [] });
  if (env.length > 0) {
    console.log(chalk.bold('\nEnvironment\n'));
    for (const c of env) {
      const mark = c.ok ? chalk.green('✓') : chalk.yellow('✗');
      const detail = c.detail ? chalk.dim(` (${c.detail})`) : '';
      const fix = !c.ok && c.fix ? chalk.dim(`  Run: ${c.fix}`) : '';
      console.log(`  ${mark} ${c.label}${detail}${fix}`);
    }
  }

  if (allOk) {
    console.log(chalk.green('\nEverything looks good.\n'));
  } else {
    console.log(chalk.yellow('\nIssues found. Run `pscode update` or `pscode init` to fix.\n'));
    process.exitCode = 1;
  }
}
