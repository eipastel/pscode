/**
 * GitHub Projects Configuration
 *
 * Types and utilities for reading the optional `pscode/github.yaml`
 * integration file. This file is created by /ps:github-setup (or manually)
 * and consumed at runtime by all GitHub-Projects-aware skills and commands.
 *
 * The config is intentionally minimal: it stores only the IDs that the `gh`
 * CLI needs to update project item status and post issue comments. No MCP
 * server is required — the `gh` binary handles all GitHub API calls.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { PipelineStageKey } from './pipeline-stages.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps pscode pipeline stage keys to GitHub Projects status option IDs.
 * Not all stages need to be configured — unused stages are omitted.
 */
export type GitHubStatusMap = Partial<Record<PipelineStageKey, string>>;

export interface GitHubProjectsConfig {
  /** GitHub repository in "owner/repo" format */
  repo: string;
  /** GitHub Projects (v2) project number (visible in the project URL) */
  project: number;
  /** Project GraphQL node ID (e.g. PVT_xxx) — needed for item-edit */
  projectNodeId: string;
  /** Status field ID (e.g. PVTSSF_xxx) — needed for item-edit */
  statusFieldId: string;
  /**
   * Path to the `gh` CLI binary.
   * Defaults to `"gh"` (assumed to be on PATH).
   * Override for non-standard installations, e.g. on Windows with WSL.
   */
  gh?: string;
  /**
   * Prefix used to extract an issue number from the change name.
   * The pattern `<issuePattern>-NN` is matched (e.g. "issue-42-my-feature" → 42).
   * Defaults to `"issue"` when absent.
   * Set to `"none"` to disable automatic extraction.
   */
  issuePattern?: string;
  /**
   * Manual change-name → issue-number overrides.
   * Takes precedence over `issuePattern` matching.
   */
  links?: Record<string, number>;
  /** Map of pscode pipeline stage keys to GitHub Projects status option IDs */
  statuses: GitHubStatusMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// File path resolution
// ─────────────────────────────────────────────────────────────────────────────

export const GITHUB_PROJECTS_CONFIG_FILENAME = 'github.yaml';

/**
 * Returns the expected path for `pscode/github.yaml` relative to a project root.
 */
export function getGitHubProjectsConfigPath(projectPath: string): string {
  return path.join(projectPath, 'pscode', GITHUB_PROJECTS_CONFIG_FILENAME);
}

// ─────────────────────────────────────────────────────────────────────────────
// Read / Write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads `pscode/github.yaml` from the given project root.
 * Returns `null` if the file does not exist, is unparseable, or is missing
 * required fields (`repo`, `project`, `projectNodeId`, `statusFieldId`).
 */
export function readGitHubProjectsConfig(projectPath: string): GitHubProjectsConfig | null {
  const configPath = getGitHubProjectsConfigPath(projectPath);

  try {
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = parseYaml(raw) as GitHubProjectsConfig;
    if (!parsed?.repo || !parsed?.projectNodeId || !parsed?.statusFieldId) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Writes a `GitHubProjectsConfig` to `pscode/github.yaml`.
 */
export function writeGitHubProjectsConfig(
  projectPath: string,
  config: GitHubProjectsConfig,
): void {
  const configPath = getGitHubProjectsConfigPath(projectPath);
  const yaml = stringifyYaml(config, { lineWidth: 0 });
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, yaml, 'utf-8');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the `gh` binary path from config, defaulting to `"gh"`.
 */
export function resolveGhBin(config: GitHubProjectsConfig): string {
  return config.gh ?? 'gh';
}

/**
 * Extracts `owner` from `config.repo` (component before the first `/`).
 */
export function resolveOwner(config: GitHubProjectsConfig): string {
  return config.repo.split('/')[0];
}

/**
 * Extracts an issue number from a change name using the configured pattern.
 *
 * Resolution order:
 * 1. `config.links[changeName]` — explicit manual override
 * 2. Pattern `<issuePattern>-NN` match against the change name
 * 3. `null` — no issue number found
 */
export function extractIssueNumber(
  changeName: string,
  config: GitHubProjectsConfig,
): number | null {
  if (config.links && config.links[changeName] !== undefined) {
    return config.links[changeName];
  }

  const pattern = config.issuePattern ?? 'issue';
  if (pattern === 'none') return null;

  const regex = new RegExp(`(?:^|[^a-z])${pattern}-(\\d+)`, 'i');
  const match = changeName.match(regex);
  return match ? parseInt(match[1], 10) : null;
}
