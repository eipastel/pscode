/**
 * GitHub Projects setup, run once from `pscode init`.
 *
 * This is the `gh`-calling half of the integration (the pure schema/helpers
 * live in `core/github.ts`). It asks one question — use an existing Project,
 * create a new one, or skip — then discovers the GraphQL ids `gh` needs and
 * writes `pscode/github.yaml`.
 *
 * Every step is **non-blocking**: any `gh`/network failure prints a localized
 * hint and returns "disabled" so `init` always completes.
 */

import { spawn, spawnSync } from 'node:child_process';
import path from 'path';
import chalk from 'chalk';
import type { InitMessages } from '../core/i18n.js';
import { createSpinner } from '../core/spinner.js';
import {
  GITHUB_STAGES,
  type GitHubConfig,
  type GitHubStage,
  parseProjectUrl,
  writeGitHubConfig,
} from '../core/github.js';

export interface GitHubSetupOptions {
  /** Tri-state from `--github` / `--no-github`. `false` always skips. */
  github?: boolean;
  /** `--project <url|owner/repo>` for non-interactive setup. */
  project?: string;
  /** Override the `gh` binary. */
  ghBin?: string;
}

/** Run `gh` capturing stdout. Never throws. */
function gh(bin: string, args: string[], cwd?: string): { ok: boolean; stdout: string } {
  try {
    const res = spawnSync(bin, args, { cwd, encoding: 'utf-8', windowsHide: true, timeout: 20_000 });
    if (res.error || res.status !== 0) return { ok: false, stdout: (res.stdout ?? '').trim() };
    return { ok: true, stdout: (res.stdout ?? '').trim() };
  } catch {
    return { ok: false, stdout: '' };
  }
}

/**
 * Async sibling of {@link gh}: runs `gh` via `spawn` so the event loop stays
 * free and a spinner can animate while it works. Mirrors `gh`'s contract — a
 * 20s timeout, never throws — but returns the captured stdout so callers can
 * tell a real failure/timeout (`ok: false`) apart from a clean empty result.
 */
function ghAsync(bin: string, args: string[], cwd?: string): Promise<{ ok: boolean; stdout: string }> {
  return new Promise((resolve) => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(bin, args, { cwd, windowsHide: true });
    } catch {
      resolve({ ok: false, stdout: '' });
      return;
    }
    let stdout = '';
    let settled = false;
    const settle = (ok: boolean): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok, stdout: stdout.trim() });
    };
    const timer = setTimeout(() => {
      child.kill();
      settle(false);
    }, 20_000);
    child.stdout?.setEncoding('utf-8');
    child.stdout?.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.on('error', () => settle(false));
    child.on('close', (code) => settle(code === 0));
  });
}

/** Run `gh` and parse JSON stdout, or `null` on any failure. */
function ghJson<T>(bin: string, args: string[], cwd?: string): T | null {
  const res = gh(bin, args, cwd);
  if (!res.ok) return null;
  try {
    return JSON.parse(res.stdout) as T;
  } catch {
    return null;
  }
}

/** `owner/repo` for the current repository (where Issues will be created). */
function currentRepo(bin: string, cwd: string): string | null {
  const data = ghJson<{ nameWithOwner?: string }>(bin, ['repo', 'view', '--json', 'nameWithOwner'], cwd);
  return data?.nameWithOwner ?? null;
}

/** GraphQL node id of a Project, trying the owner type first, then the other. */
function projectNodeId(bin: string, owner: string, ownerType: 'org' | 'user', number: number): string | null {
  const roots: Array<'user' | 'organization'> =
    ownerType === 'org' ? ['organization', 'user'] : ['user', 'organization'];
  for (const root of roots) {
    const query = `query($o:String!,$n:Int!){${root}(login:$o){projectV2(number:$n){id}}}`;
    const data = ghJson<{ data?: Record<string, { projectV2?: { id?: string } }> }>(bin, [
      'api',
      'graphql',
      '-f',
      `query=${query}`,
      '-F',
      `o=${owner}`,
      '-F',
      `n=${number}`,
    ]);
    const id = data?.data?.[root]?.projectV2?.id;
    if (id) return id;
  }
  return null;
}

interface FieldListResponse {
  fields?: Array<{ id: string; name: string; options?: Array<{ id: string; name: string }> }>;
}

/**
 * Map a Status option name onto one of PSCode's nine flow stages. Recognizes
 * both the plain names and the full board columns `pscode-board-setup` creates
 * (Backlog, In Refinement, Ready to Dev, In Development, In Code Review, In
 * Test, Ready to Deploy, Done, Cancelled). Unrecognized columns are ignored.
 */
function stageForOption(name: string): GitHubStage | null {
  const n = name.trim().toLowerCase();
  if (n === 'backlog') return 'backlog';
  if (n === 'proposed' || n === 'todo' || n === 'to do' || n === 'in refinement') return 'proposed';
  if (n === 'ready to dev' || n === 'ready for dev' || n === 'ready') return 'ready_to_dev';
  if (n === 'in progress' || n === 'in-progress' || n === 'doing' || n === 'in development')
    return 'in_progress';
  if (n === 'review' || n === 'in review' || n === 'in code review') return 'review';
  if (n === 'in test' || n === 'in testing' || n === 'testing') return 'in_test';
  if (n === 'ready to deploy' || n === 'ready for deploy') return 'ready_to_deploy';
  if (n === 'done' || n === 'complete' || n === 'completed') return 'done';
  if (n === 'cancelled' || n === 'canceled') return 'cancelled';
  return null;
}

interface StatusField {
  statusFieldId: string;
  statuses: Partial<Record<GitHubStage, string>>;
}

/** Discover the single-select Status field id and its stage→option-id map. */
function statusField(bin: string, owner: string, number: number): StatusField | null {
  const data = ghJson<FieldListResponse>(bin, [
    'project',
    'field-list',
    String(number),
    '--owner',
    owner,
    '--format',
    'json',
  ]);
  const field = data?.fields?.find((f) => f.name.toLowerCase() === 'status' && f.options);
  if (!field?.options) return null;
  const statuses: Partial<Record<GitHubStage, string>> = {};
  for (const opt of field.options) {
    const stage = stageForOption(opt.name);
    if (stage && !statuses[stage]) statuses[stage] = opt.id;
  }
  return { statusFieldId: field.id, statuses };
}

/** Build the github.yaml config for a known owner + project number. */
function buildConfigFor(
  bin: string,
  repo: string,
  owner: string,
  ownerType: 'org' | 'user',
  number: number
): GitHubConfig | null {
  const nodeId = projectNodeId(bin, owner, ownerType, number);
  if (!nodeId) return null;
  const status = statusField(bin, owner, number);
  if (!status) return null;
  return {
    repo,
    owner,
    ownerType,
    project: number,
    projectNodeId: nodeId,
    statusFieldId: status.statusFieldId,
    gh: bin,
    issuePattern: 'issue',
    links: {},
    statuses: status.statuses,
  };
}

interface ProjectListItem {
  number: number;
  title: string;
  url: string;
}

type ResolvedRef = { owner: string; ownerType: 'org' | 'user'; number: number };

/** List an owner's Projects (number + title + url), newest-first as `gh` returns them. */
function listProjects(bin: string, owner: string): ProjectListItem[] {
  const list = ghJson<ProjectListItem[] | { projects?: ProjectListItem[] }>(bin, [
    'project',
    'list',
    '--owner',
    owner,
    '--format',
    'json',
    '--limit',
    '50',
  ]);
  const projects = Array.isArray(list) ? list : (list?.projects ?? []);
  return projects.map((p) => ({ number: p.number, title: p.title ?? '', url: p.url ?? '' }));
}

/** Outcome of an async Project search: a list (possibly empty) or a clear failure. */
type ProjectSearch = { ok: true; projects: ProjectListItem[] } | { ok: false };

/**
 * Async sibling of {@link listProjects} that keeps the error/empty distinction:
 * a failed or timed-out `gh` call (or unparseable output) yields `{ ok: false }`,
 * while a clean run yields `{ ok: true, projects }` — even when `projects` is `[]`.
 */
async function listProjectsAsync(bin: string, owner: string): Promise<ProjectSearch> {
  const res = await ghAsync(bin, ['project', 'list', '--owner', owner, '--format', 'json', '--limit', '50']);
  if (!res.ok) return { ok: false };
  let parsed: ProjectListItem[] | { projects?: ProjectListItem[] } | null;
  try {
    parsed = JSON.parse(res.stdout) as ProjectListItem[] | { projects?: ProjectListItem[] };
  } catch {
    return { ok: false };
  }
  const projects = Array.isArray(parsed) ? parsed : (parsed?.projects ?? []);
  return { ok: true, projects: projects.map((p) => ({ number: p.number, title: p.title ?? '', url: p.url ?? '' })) };
}

/** Turn a list item into a resolved ref, reading owner type from its url when possible. */
function refFromListItem(owner: string, item: ProjectListItem): ResolvedRef {
  return parseProjectUrl(item.url) ?? { owner, ownerType: 'user', number: item.number };
}

/** Resolve {owner, ownerType, number} from a Project URL or an owner/repo ref. */
function resolveProjectRef(bin: string, ref: string): ResolvedRef | null {
  const url = parseProjectUrl(ref);
  if (url) return url;
  // owner/repo (or bare owner): list that owner's projects and take the first.
  const owner = ref.includes('/') ? ref.split('/')[0] : ref.trim();
  if (!owner) return null;
  const projects = listProjects(bin, owner);
  if (!projects.length) return null;
  return refFromListItem(owner, projects[0]);
}

/**
 * Interactive picker for an existing Project: list the repo owner's Projects and
 * let the user choose one, or pick "Other" to paste a link/owner-repo. Falls back
 * to the paste prompt when nothing can be listed (e.g. missing `project` scope).
 */
async function pickExistingProject(bin: string, repo: string, t: InitMessages): Promise<ResolvedRef | null> {
  const owner = repo.split('/')[0];
  const { select, input } = await import('@inquirer/prompts');

  // Animate while the (now async) search runs; end in the matching state.
  const spinner = createSpinner(t.githubSearchingProjects).start();
  const search = await listProjectsAsync(bin, owner);

  if (search.ok && search.projects.length > 0) {
    spinner.stop(); // the select list below is the feedback.
    const { projects } = search;
    const choice = await select<number | 'other'>({
      message: t.githubPickProject,
      choices: [
        ...projects.map((p) => ({ name: `#${p.number} ${p.title}`.trim(), value: p.number })),
        { name: t.githubOtherProject, value: 'other' as const },
      ],
    });
    if (choice !== 'other') {
      const picked = projects.find((p) => p.number === choice)!;
      return refFromListItem(owner, picked);
    }
  } else if (search.ok) {
    spinner.stop(); // clean run, just no Projects on the account.
    console.log(chalk.dim(`  ${t.githubNoProjects}`));
  } else {
    spinner.fail(t.githubSearchFailed); // failed/timed out — distinct from empty.
  }

  const ref = await input({ message: t.githubProjectLinkPrompt });
  return resolveProjectRef(bin, ref);
}

/** Warn (non-blocking) and return disabled. */
function fail(t: InitMessages, reason: string): false {
  console.log(chalk.yellow(`  ${t.githubSetupFailed(reason)}`));
  return false;
}

/**
 * Run the GitHub Projects setup. Returns whether the integration ended up
 * enabled (a valid `github.yaml` was written). Always resolves — never throws.
 */
export async function runGitHubSetup(
  projectRoot: string,
  opts: GitHubSetupOptions,
  interactive: boolean,
  t: InitMessages
): Promise<boolean> {
  if (opts.github === false) return false;
  const bin = opts.ghBin || 'gh';

  // Decide the mode: explicit --project, interactive question, or skip.
  let mode: 'existing' | 'create' | 'skip';
  const ref = opts.project ?? '';

  if (opts.project) {
    mode = 'existing';
  } else if (interactive) {
    const { select } = await import('@inquirer/prompts');
    mode = await select<'existing' | 'create' | 'skip'>({
      message: t.githubQuestion,
      choices: [
        { name: t.githubHaveProject, value: 'existing' },
        { name: t.githubCreateProject, value: 'create' },
        { name: t.githubSkip, value: 'skip' },
      ],
      default: 'skip',
    });
  } else {
    return false; // non-interactive with no --project: nothing to do.
  }

  if (mode === 'skip') return false;

  const repo = currentRepo(bin, projectRoot);
  if (!repo) return fail(t, 'gh auth / GitHub remote');

  if (mode === 'existing') {
    // `--project` is resolved directly; otherwise list the account's Projects.
    const resolved = ref ? resolveProjectRef(bin, ref) : await pickExistingProject(bin, repo, t);
    if (!resolved) return fail(t, ref || 'project');
    const config = buildConfigFor(bin, repo, resolved.owner, resolved.ownerType, resolved.number);
    if (!config) return fail(t, ref || 'project');
    writeGitHubConfig(projectRoot, config);
    return true;
  }

  // mode === 'create' — let the user name the Project, defaulting to the
  // project folder name.
  const defaultTitle = path.basename(projectRoot);
  let title = defaultTitle;
  if (interactive) {
    const { input } = await import('@inquirer/prompts');
    const answer = await input({ message: t.githubProjectNamePrompt, default: defaultTitle });
    title = answer.trim() || defaultTitle;
  }
  console.log(chalk.dim(`  ${t.githubCreating}`));
  const owner = repo.split('/')[0];
  const created = ghJson<{ number?: number }>(bin, [
    'project',
    'create',
    '--owner',
    owner,
    '--title',
    title,
    '--format',
    'json',
  ]);
  if (!created?.number) return fail(t, 'gh project create');
  const config = buildConfigFor(bin, repo, owner, 'user', created.number);
  if (!config) return fail(t, 'gh project create');
  writeGitHubConfig(projectRoot, config);
  // A freshly created Project ships only Todo/In Progress/Done — note any gaps.
  // `/ps:board-setup` configures the full board (see init's open/hint).
  const missing = GITHUB_STAGES.filter((s) => !config.statuses[s]);
  if (missing.length) {
    console.log(chalk.dim(`  + run /ps:board-setup to configure the board (${missing.join(', ')}…)`));
  }
  return true;
}
