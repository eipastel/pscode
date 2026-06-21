/**
 * Launching the user's coding agent after `init`.
 *
 * Once the rails are installed, init can hand the terminal off to the agent's
 * CLI (`claude`, `codex`, `gemini`). Claude Code is always preferred when more
 * than one agent is selected. Cursor has no unambiguous CLI, so it is skipped.
 */

import { spawnSync } from 'child_process';
import { AGENTS, getAgent } from './config.js';

/**
 * The agent to open among the selected ones, prioritizing Claude Code, then
 * falling back to the AGENTS order. Returns null when none is launchable
 * (e.g. only Cursor was selected).
 */
export function openTarget(agents: string[]): string | null {
  const launchable = AGENTS.filter((a) => a.launchCommand && agents.includes(a.id));
  if (launchable.length === 0) return null;
  const claude = launchable.find((a) => a.id === 'claude');
  return (claude ?? launchable[0]).id;
}

/** The CLI command that launches an agent, or null when it has none. */
export function launchCommandFor(agentId: string): string | null {
  return getAgent(agentId)?.launchCommand ?? null;
}

/** True when there is a real terminal to hand off to (never in CI/piped runs). */
export function canHandOffTerminal(): boolean {
  return Boolean(process.stdout.isTTY && process.stdin.isTTY);
}

/**
 * Launch the agent's CLI in the project, inheriting the terminal so it takes
 * over until the user quits. Returns false when the command can't be spawned.
 *
 * `initialCommand` (e.g. `/ps:board-setup`) is passed as the agent's first
 * prompt — only for Claude Code, which reliably runs a slash command given as
 * an argument; other CLIs ignore it.
 */
export function launchAgent(agentId: string, projectRoot: string, initialCommand?: string): boolean {
  const command = launchCommandFor(agentId);
  if (!command) return false;
  const args = initialCommand && agentId === 'claude' ? [initialCommand] : [];
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    // On Windows the agent CLIs are .cmd/.ps1 shims resolved via the shell.
    shell: process.platform === 'win32',
  });
  return !result.error;
}
