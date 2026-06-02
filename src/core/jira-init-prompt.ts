/**
 * JIRA Init Prompt
 *
 * Handles the interactive JIRA setup questions during `pscode init --profile dixi`.
 * Saves a `pscode/jira.yaml` skeleton with `configured: false` and the full
 * `pipeline` block so that `/ps:board-setup` (in the agent, where the Atlassian
 * MCP is available) can pick up where the CLI left off and discover the real
 * `status_id`/`transition` per stage. The CLI cannot call the MCP directly, so
 * it only collects `project_key` and `board_url`.
 */

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {
  buildJiraConfigSkeleton,
  getJiraConfigPath,
  readJiraConfigSync,
  writeJiraConfig,
} from './jira-config.js';

/**
 * Runs the interactive JIRA setup questions during `pscode init --profile dixi`.
 * Returns whether the user chose to set up JIRA.
 *
 * `pscodePath` is the `<root>/pscode` directory (as passed by the init command).
 */
export async function runJiraInitPrompt(pscodePath: string): Promise<boolean> {
  const projectPath = path.dirname(pscodePath);
  const configPath = getJiraConfigPath(projectPath);

  // If already configured (completed), skip silently
  const existing = readJiraConfigSync(projectPath);
  if (existing?.configured === true) {
    console.log(chalk.dim('  JIRA: already configured (skipping)'));
    return true;
  }

  const { confirm, input } = await import('@inquirer/prompts');

  console.log();
  console.log(chalk.bold('JIRA Integration'));
  console.log(chalk.dim('  Sync issues automatically as changes move through your workflow.'));
  console.log();

  // ── Step 1: opt-in ─────────────────────────────────────────────────────────
  const wantsJira = await confirm({
    message: 'Configure JIRA integration?',
    default: false,
  });

  if (!wantsJira) {
    // Ensure a skeleton exists so /ps:board-setup can complete it later.
    if (!fs.existsSync(configPath)) {
      writeJiraConfig(projectPath, buildJiraConfigSkeleton());
    }
    return false;
  }

  // ── Step 2: project key + board URL ────────────────────────────────────────
  const projectKey = (
    await input({
      message: 'JIRA project key (e.g. PROJ):',
      default: existing?.project_key ?? '',
    })
  ).trim();

  const boardUrl = (
    await input({
      message: 'Board URL (optional):',
      default: existing?.board_url ?? '',
    })
  ).trim();

  // ── Step 3: save skeleton (configured stays false) ─────────────────────────
  // The CLI cannot reach the Atlassian MCP, so status_ids/transitions are left
  // empty for /ps:board-setup to discover. `configured` only flips to true there.
  const config = buildJiraConfigSkeleton({
    project_key: projectKey,
    board_url: boardUrl,
    configured: false,
    ...(existing?.pipeline ? { pipeline: existing.pipeline } : {}),
  });

  writeJiraConfig(projectPath, config);

  console.log();
  console.log(chalk.dim(`  Saved to ${getJiraConfigPath(projectPath)}.`));
  console.log(chalk.dim('  Run /ps:board-setup in Claude Code to discover status ids and transitions.'));

  return true;
}
