/**
 * Core constants for the PSCode guided SDD installer.
 *
 * PSCode is a lightweight installer: it lays down slash commands, skills,
 * instructions and a minimal file structure so coding agents (Claude Code,
 * Codex, Cursor, Gemini) can follow a short, guided, human-validated
 * spec-driven flow. It is intentionally *not* a workflow engine — the agent
 * drives the flow; PSCode just installs the rails.
 */

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** Package version, read from package.json at runtime. */
export const PSCODE_VERSION: string = (require('../../package.json') as { version: string }).version;

/** Name of the project-level PSCode directory. */
export const PSCODE_DIR = 'pscode';

/** Managed-block markers used inside AGENTS.md / CLAUDE.md. */
export const MANAGED_MARKERS = {
  start: '<!-- PSCODE:START -->',
  end: '<!-- PSCODE:END -->',
} as const;

/** A supported coding agent. */
export interface Agent {
  /** Stable id (used in config and flags). */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Root config directory the agent reads (e.g. `.claude`). */
  dir: string;
  /** Project instruction file the agent reads (e.g. `CLAUDE.md`). */
  instructionFile: string;
  /** Paths whose presence signals the agent is in use (relative to project root). */
  detectionPaths: string[];
  /**
   * CLI command that launches the agent in the project. Omitted when there is
   * no unambiguous CLI to hand the terminal off to (e.g. Cursor).
   */
  launchCommand?: string;
}

/** Agents PSCode can install the guided workflow into. */
export const AGENTS: Agent[] = [
  { id: 'claude', name: 'Claude Code', dir: '.claude', instructionFile: 'CLAUDE.md', detectionPaths: ['.claude'], launchCommand: 'claude' },
  { id: 'codex', name: 'Codex', dir: '.codex', instructionFile: 'AGENTS.md', detectionPaths: ['.codex'], launchCommand: 'codex' },
  { id: 'cursor', name: 'Cursor', dir: '.cursor', instructionFile: 'AGENTS.md', detectionPaths: ['.cursor'] },
  { id: 'gemini', name: 'Gemini CLI', dir: '.gemini', instructionFile: 'AGENTS.md', detectionPaths: ['.gemini'], launchCommand: 'gemini' },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

/**
 * The distinct instruction files the given agents read. Claude Code uses
 * `CLAUDE.md`; the others share the cross-agent `AGENTS.md`. Falls back to
 * `AGENTS.md` when no known agent is given.
 */
export function instructionFilesFor(agentIds: string[]): string[] {
  const files = new Set<string>();
  for (const id of agentIds) {
    const agent = getAgent(id);
    if (agent) files.add(agent.instructionFile);
  }
  if (files.size === 0) files.add('AGENTS.md');
  return [...files];
}

/** Default profile installed by `pscode init`. */
export const DEFAULT_PROFILE = 'guided';

/**
 * Size limits the guided workflow encourages. The rule of thumb: each step
 * should fit on one terminal screen. These are written into config.yaml so
 * the agent (and the user) can see and tune them.
 */
export const DEFAULT_LIMITS = {
  max_brief_lines: 40,
  max_design_lines: 30,
  max_questions: 5,
} as const;
