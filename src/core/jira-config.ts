/**
 * JIRA Configuration
 *
 * Types and utilities for reading/writing the optional `pscode/jira.yaml`
 * integration file used by the `dixi` profile. This file is scaffolded by
 * `pscode init --profile dixi` and completed by `/ps:board-setup` (inside the
 * agent, where the Atlassian MCP is available). It is the JIRA counterpart of
 * `trello-config.ts`.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { PSCODE_DIR_NAME } from './config.js';
import { PIPELINE_STAGE_KEYS, type PipelineStageKey } from './pipeline-stages.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One JIRA pipeline stage. All fields are optional because they are discovered
 * incrementally: the CLI scaffolds empty placeholders and `/ps:board-setup`
 * fills `status_id`/`transition` from the real board via the Atlassian MCP.
 */
export interface JiraPipelineStage {
  /** JIRA status id that represents this stage (e.g. "10001"). */
  status_id?: string;
  /** Status category (e.g. "To Do", "In Progress", "Done"). */
  category?: string;
  /** Transition id that moves an issue into this stage. */
  transition?: string;
}

/**
 * Map of semantic stage → JIRA pipeline stage. Keys come from the shared
 * {@link PipelineStageKey} set, mirroring `TrelloListMap`.
 */
export type JiraPipelineMap = Partial<Record<PipelineStageKey, JiraPipelineStage>>;

export interface JiraConfig {
  /** JIRA project key (e.g. "PROJ"). */
  project_key?: string;
  /** Board URL (informational, helps the setup command locate the board). */
  board_url?: string;
  /** Default issue type for new issues (e.g. "Story", "Task"). */
  default_issue_type?: string;
  /** Whether the integration has been fully configured. */
  configured?: boolean;
  /** Workflow transitions keyed by intent. */
  transitions?: {
    /** Transition id that moves an issue to "done". */
    done?: string;
  };
  /** Per-stage JIRA pipeline mapping. */
  pipeline?: JiraPipelineMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// File path resolution
// ─────────────────────────────────────────────────────────────────────────────

export const JIRA_CONFIG_FILENAME = 'jira.yaml';

/**
 * Returns the expected path for `pscode/jira.yaml` relative to a project root.
 */
export function getJiraConfigPath(projectPath: string): string {
  return path.join(projectPath, PSCODE_DIR_NAME, JIRA_CONFIG_FILENAME);
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds an empty JIRA pipeline skeleton with all semantic stages present and
 * empty placeholder fields, ready to be completed by `/ps:board-setup`.
 */
export function buildJiraPipelineSkeleton(): JiraPipelineMap {
  const pipeline: JiraPipelineMap = {};
  for (const key of PIPELINE_STAGE_KEYS) {
    pipeline[key] = { status_id: '', category: '', transition: '' };
  }
  return pipeline;
}

/**
 * Builds the default `jira.yaml` skeleton written by `init --profile dixi`.
 */
export function buildJiraConfigSkeleton(overrides: Partial<JiraConfig> = {}): JiraConfig {
  return {
    project_key: '',
    board_url: '',
    default_issue_type: '',
    configured: false,
    transitions: { done: '' },
    pipeline: buildJiraPipelineSkeleton(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read / Write (sync — used by init and the setup prompt)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads `pscode/jira.yaml` from the given project root.
 * Returns `null` if the file does not exist or is unparseable.
 */
export function readJiraConfigSync(projectPath: string): JiraConfig | null {
  const configPath = getJiraConfigPath(projectPath);

  try {
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, 'utf-8');
    return parseYaml(raw) as JiraConfig;
  } catch {
    return null;
  }
}

/**
 * Writes a `JiraConfig` to `pscode/jira.yaml`.
 */
export function writeJiraConfig(projectPath: string, config: JiraConfig): void {
  const configPath = getJiraConfigPath(projectPath);
  const yaml = stringifyYaml(config, { lineWidth: 0 });
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, yaml, 'utf-8');
}
