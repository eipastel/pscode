/**
 * Environment preflight — run as much verification as a CLI can at `init` time
 * so the agent never has to rediscover it later.
 *
 * The brief's priority: concentrate environment checks in `init` (and `doctor`),
 * record what was found, and let the agent *consume* the result rather than
 * re-probe. Everything here is **non-blocking and informational** — a failed
 * check reports how to fix it and `init` carries on.
 *
 * Note on MCP: a CLI cannot know whether an MCP server is *connected* at
 * runtime (that is agent state). It can only see whether one is *declared* in
 * the project's MCP config files. {@link scanMcpServers} reports the declared
 * set; the agent confirms the live connection using the manifest `init` writes.
 */

import { spawnSync } from 'node:child_process';
import path from 'path';
import { getAgent } from './config.js';
import { readFile } from './fs-utils.js';

/** A single environment check. Stable `id`, terse English `label`. */
export interface PreflightCheck {
  /** Stable identifier (used by the manifest and by `doctor`). */
  id: string;
  /** Short English label shown next to the ✓/✗ mark. */
  label: string;
  ok: boolean;
  /** Extra context (a version, a value) shown dimmed. */
  detail?: string;
  /** Command the user can run to fix a failing check. */
  fix?: string;
}

/** Run a command, capturing stdout. Never throws — missing binaries report `ok: false`. */
function run(bin: string, args: string[], cwd?: string): { ok: boolean; stdout: string } {
  try {
    const res = spawnSync(bin, args, {
      cwd,
      encoding: 'utf-8',
      windowsHide: true,
      timeout: 10_000,
    });
    if (res.error || res.status !== 0) {
      return { ok: false, stdout: (res.stdout ?? '').trim() };
    }
    return { ok: true, stdout: (res.stdout ?? '').trim() };
  } catch {
    return { ok: false, stdout: '' };
  }
}

/** True when an `origin` URL points at GitHub (https or ssh form). */
function isGitHubRemote(url: string): boolean {
  return /github\.com[/:]/i.test(url);
}

/** Parse a semver-ish `major.minor.patch` prefix from arbitrary version output. */
function parseVersionParts(text: string): number[] | null {
  const m = text.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Compare two semver triples; >= 0 means `a >= b`. */
function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

const MIN_NODE = [20, 19, 0];

/**
 * MCP config files to inspect, with the JSON key that holds the server map.
 * Different agents/editors use different shapes (`mcpServers` vs `servers`).
 */
const MCP_SOURCES: Array<{ file: string; keys: string[] }> = [
  { file: '.mcp.json', keys: ['mcpServers', 'servers'] },
  { file: path.join('.cursor', 'mcp.json'), keys: ['mcpServers', 'servers'] },
  { file: path.join('.vscode', 'mcp.json'), keys: ['servers', 'mcpServers'] },
  { file: path.join('.claude', 'settings.json'), keys: ['mcpServers'] },
  { file: path.join('.claude', 'settings.local.json'), keys: ['mcpServers'] },
];

/**
 * The MCP servers **declared** across the project's MCP config files (not the
 * ones actually connected — a CLI cannot observe that). Returns sorted, unique
 * server names.
 */
export function scanMcpServers(projectRoot: string): string[] {
  const found = new Set<string>();
  for (const source of MCP_SOURCES) {
    const raw = readFile(path.join(projectRoot, source.file));
    if (raw === null) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== 'object') continue;
    const obj = parsed as Record<string, unknown>;
    for (const key of source.keys) {
      const map = obj[key];
      if (map && typeof map === 'object') {
        for (const name of Object.keys(map as Record<string, unknown>)) found.add(name);
      }
    }
  }
  return [...found].sort();
}

export interface PreflightOptions {
  /** Agents selected by the wizard — used to probe the matching CLI. */
  agents?: string[];
  /** Override the `gh` binary (Windows/WSL custom paths). Defaults to `gh`. */
  ghBin?: string;
}

/**
 * Run every system-level check we can. Pure data out — the caller decides how
 * to present (and localize) it. All checks are non-blocking.
 */
export function collectPreflight(projectRoot: string, opts: PreflightOptions = {}): PreflightCheck[] {
  const checks: PreflightCheck[] = [];
  const gh = opts.ghBin || 'gh';

  // Git
  const git = run('git', ['--version']);
  checks.push({ id: 'git', label: 'Git installed', ok: git.ok, fix: git.ok ? undefined : 'install git' });

  const inRepo = git.ok && run('git', ['rev-parse', '--is-inside-work-tree'], projectRoot).stdout === 'true';
  checks.push({ id: 'git-repo', label: 'Inside a git repository', ok: inRepo, fix: inRepo ? undefined : 'git init' });

  const remote = inRepo ? run('git', ['remote', 'get-url', 'origin'], projectRoot) : { ok: false, stdout: '' };
  const remoteOnGitHub = remote.ok && isGitHubRemote(remote.stdout);
  checks.push({
    id: 'git-remote',
    label: 'GitHub remote configured',
    ok: remoteOnGitHub,
    detail: remote.ok ? remote.stdout : undefined,
    fix: remoteOnGitHub ? undefined : 'git remote add origin <github-url>',
  });

  // GitHub CLI
  const ghVersion = run(gh, ['--version']);
  checks.push({ id: 'gh', label: 'GitHub CLI installed', ok: ghVersion.ok, fix: ghVersion.ok ? undefined : 'install gh (https://cli.github.com)' });

  const ghAuth = ghVersion.ok && run(gh, ['auth', 'status']).ok;
  checks.push({ id: 'gh-auth', label: 'GitHub CLI authenticated', ok: ghAuth, fix: ghAuth ? undefined : 'gh auth login' });

  // Node
  const nodeParts = parseVersionParts(process.version) ?? [0, 0, 0];
  const nodeOk = compareVersions(nodeParts, MIN_NODE) >= 0;
  checks.push({
    id: 'node',
    label: `Node >= ${MIN_NODE.join('.')}`,
    ok: nodeOk,
    detail: process.version,
    fix: nodeOk ? undefined : `upgrade Node to >= ${MIN_NODE.join('.')}`,
  });

  // Agent CLI (best-effort — many ship as shims that may not resolve here).
  for (const agentId of opts.agents ?? []) {
    const agent = getAgent(agentId);
    if (!agent?.launchCommand) continue;
    const probe = run(agent.launchCommand, ['--version']);
    checks.push({
      id: `agent-${agentId}`,
      label: `${agent.name} CLI available`,
      ok: probe.ok,
      fix: probe.ok ? undefined : `install the ${agent.name} CLI (\`${agent.launchCommand}\`)`,
    });
  }

  // MCP servers declared in the project (configured, not necessarily connected).
  const mcp = scanMcpServers(projectRoot);
  if (mcp.length > 0) {
    checks.push({ id: 'mcp', label: 'MCP servers declared', ok: true, detail: mcp.join(', ') });
  }

  return checks;
}
