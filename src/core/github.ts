/**
 * `pscode/github.yaml` — the GitHub Projects (v2) + Issues binding.
 *
 * Written by `pscode init` once, then read by the agent during the guided flow
 * to keep the Issue, the board status and comments in sync. This module is the
 * **pure** half: schema, read/write, and small helpers. The `gh`-calling setup
 * lives in `commands/init-github.ts`.
 *
 * A config missing any of the three identifiers PSCode cannot work without
 * (`repo`, `projectNodeId`, `statusFieldId`) reads back as `null` — the
 * integration is simply treated as disabled, never a crash.
 */

import path from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { PSCODE_DIR } from './config.js';
import { exists, readFile, writeFile } from './fs-utils.js';

/**
 * The board stages PSCode maps the flow onto, in board order. One per column of
 * the standard kanban (see `pscode-board-setup`). The legacy five keys
 * (`backlog`, `proposed`, `in_progress`, `review`, `done`) are kept and four
 * were added for the intermediate columns the guided flow now moves through.
 *
 * | Stage key         | Board column   | Driven by      |
 * |-------------------|----------------|----------------|
 * | `backlog`         | Backlog        | `/ps:draft`    |
 * | `proposed`        | In Refinement  | `/ps:refine`   |
 * | `ready_to_dev`    | Ready to Dev   | `/ps:refine`   |
 * | `in_progress`     | In Development | `/ps:dev`      |
 * | `review`          | In Code Review | `/ps:dev`      |
 * | `in_test`         | In Test        | `/ps:dev`      |
 * | `ready_to_deploy` | Ready to Deploy| `/ps:dev`      |
 * | `done`            | Done           | `/ps:complete` |
 * | `cancelled`       | Cancelled      | `/ps:cancel`   |
 */
export const GITHUB_STAGES = [
  'backlog',
  'proposed',
  'ready_to_dev',
  'in_progress',
  'review',
  'in_test',
  'ready_to_deploy',
  'done',
  'cancelled',
] as const;
export type GitHubStage = (typeof GITHUB_STAGES)[number];

const StatusesSchema = z
  .object({
    backlog: z.string().optional(),
    proposed: z.string().optional(),
    ready_to_dev: z.string().optional(),
    in_progress: z.string().optional(),
    review: z.string().optional(),
    in_test: z.string().optional(),
    ready_to_deploy: z.string().optional(),
    done: z.string().optional(),
    cancelled: z.string().optional(),
  })
  .default({});

const GitHubConfigSchema = z.object({
  /** `owner/repo` the Issues live in. */
  repo: z.string(),
  /** Login that owns the Project (org or user) — needed by `gh project …`. */
  owner: z.string(),
  /** Whether the Project owner is an org or a user — used to build its URL. */
  ownerType: z.enum(['org', 'user']).default('user'),
  /** Project number from the URL (e.g. `3`). */
  project: z.number(),
  /** GraphQL node id of the Project (e.g. `PVT_xxx`). */
  projectNodeId: z.string(),
  /** Single-select Status field id (e.g. `PVTSSF_xxx`). */
  statusFieldId: z.string(),
  /** `gh` binary to invoke; overridable for Windows/WSL. */
  gh: z.string().default('gh'),
  /** Slug→issue derivation: `<prefix>-NN` from the slug, or `none` to disable. */
  issuePattern: z.string().default('issue'),
  /** Explicit change-slug → issue-number links (highest precedence). */
  links: z.record(z.string(), z.number()).default({}),
  /** Stage → single-select option id. */
  statuses: StatusesSchema,
});

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;

export function getGitHubConfigPath(projectRoot: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'github.yaml');
}

export function githubConfigExists(projectRoot: string): boolean {
  return exists(getGitHubConfigPath(projectRoot));
}

/**
 * Read and validate `pscode/github.yaml`. Returns `null` when absent, invalid,
 * or missing any of the required identifiers — i.e. the integration is off.
 */
export function readGitHubConfig(projectRoot: string): GitHubConfig | null {
  const raw = readFile(getGitHubConfigPath(projectRoot));
  if (raw === null) return null;
  try {
    const parsed = GitHubConfigSchema.parse(parseYaml(raw) ?? {});
    if (!parsed.repo || !parsed.owner || !parsed.projectNodeId || !parsed.statusFieldId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeGitHubConfig(projectRoot: string, config: GitHubConfig): void {
  const header =
    '# PSCode ↔ GitHub Projects binding — written by `pscode init`.\n' +
    '# The agent reads this during the guided flow to sync Issues and the board.\n';
  writeFile(getGitHubConfigPath(projectRoot), header + stringifyYaml(GitHubConfigSchema.parse(config)));
}

/** The `gh` binary to use, honoring a config override. */
export function resolveGhBin(config?: GitHubConfig | null): string {
  return config?.gh || 'gh';
}

/** The web URL of the Project (org or user form). */
export function projectUrl(config: Pick<GitHubConfig, 'owner' | 'ownerType' | 'project'>): string {
  const segment = config.ownerType === 'org' ? 'orgs' : 'users';
  return `https://github.com/${segment}/${config.owner}/projects/${config.project}`;
}

export interface ParsedProjectUrl {
  owner: string;
  ownerType: 'org' | 'user';
  number: number;
}

/**
 * Parse a GitHub Project (v2) URL into its parts. Accepts the org and user
 * forms; returns `null` for anything else.
 *
 *   https://github.com/orgs/<org>/projects/<n>
 *   https://github.com/users/<user>/projects/<n>
 */
export function parseProjectUrl(url: string): ParsedProjectUrl | null {
  const m = url
    .trim()
    .match(/github\.com\/(orgs|users)\/([^/\s]+)\/projects\/(\d+)/i);
  if (!m) return null;
  return {
    owner: m[2],
    ownerType: m[1].toLowerCase() === 'orgs' ? 'org' : 'user',
    number: Number(m[3]),
  };
}

/**
 * Derive the issue number from a change slug using only the config:
 * explicit `links` → `<prefix>-NN` pattern → `null`. An `issuePattern` of
 * `none` disables pattern derivation. (See {@link resolveIssueNumber} for the
 * full resolution that also consults the change's `.issue` file.)
 */
export function extractIssueNumber(slug: string, config: GitHubConfig): number | null {
  if (config.links[slug] !== undefined) return config.links[slug];
  if (!config.issuePattern || config.issuePattern === 'none') return null;
  const re = new RegExp(`(?:^|[^a-z])${config.issuePattern}-(\\d+)`, 'i');
  const m = slug.match(re);
  return m ? Number(m[1]) : null;
}

/** Path to the file that records a change's GitHub issue number. */
export function getChangeIssuePath(projectRoot: string, slug: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'changes', slug, '.issue');
}

/** Read the issue number stored in `pscode/changes/<slug>/.issue`, or `null`. */
export function readChangeIssue(projectRoot: string, slug: string): number | null {
  const raw = readFile(getChangeIssuePath(projectRoot, slug));
  if (raw === null) return null;
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Resolve the issue number for a change, deterministically and in full:
 * explicit `links` → the change's `.issue` file → `<prefix>-NN` pattern → `null`.
 */
export function resolveIssueNumber(
  projectRoot: string,
  slug: string,
  config: GitHubConfig
): number | null {
  if (config.links[slug] !== undefined) return config.links[slug];
  const fromFile = readChangeIssue(projectRoot, slug);
  if (fromFile !== null) return fromFile;
  return extractIssueNumber(slug, config);
}
