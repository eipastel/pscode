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
  /** Paths whose presence signals the agent is in use (relative to project root). */
  detectionPaths: string[];
}

/** Agents PSCode can install the guided workflow into. */
export const AGENTS: Agent[] = [
  { id: 'claude', name: 'Claude Code', dir: '.claude', detectionPaths: ['.claude'] },
  { id: 'codex', name: 'Codex', dir: '.codex', detectionPaths: ['.codex'] },
  { id: 'cursor', name: 'Cursor', dir: '.cursor', detectionPaths: ['.cursor'] },
  { id: 'gemini', name: 'Gemini CLI', dir: '.gemini', detectionPaths: ['.gemini'] },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
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

/** The board states, from idea to done. */
export const BOARD_STATES = [
  'draft',
  'spec-review',
  'ready',
  'doing',
  'review',
  'done',
] as const;
