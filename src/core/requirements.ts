/**
 * `pscode/requirements.yaml` — the requirements manifest.
 *
 * The point of concentrating verification in `init` is that the agent should
 * *read what init already found* instead of re-probing the environment. This
 * file records, per active integration, what it needs and what was verified:
 * the preflight check results and which MCP servers are declared.
 *
 * `configured` means an MCP server is *declared* in a project config file.
 * `connected` is deliberately absent — only the agent can confirm a live MCP
 * connection at runtime, using this manifest as its checklist.
 */

import path from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { PSCODE_DIR, PSCODE_VERSION } from './config.js';
import { readFile, writeFile } from './fs-utils.js';
import type { PreflightCheck } from './preflight.js';

const McpRequirementSchema = z.object({
  name: z.string(),
  required: z.boolean(),
  configured: z.boolean(),
});

const RequirementsSchema = z.object({
  generatedBy: z.string().default(PSCODE_VERSION),
  github: z
    .object({
      enabled: z.boolean().default(false),
      checks: z.record(z.string(), z.string()).default({}),
      mcp: z.array(McpRequirementSchema).default([]),
    })
    .optional(),
});

export type Requirements = z.infer<typeof RequirementsSchema>;

export function getRequirementsPath(projectRoot: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'requirements.yaml');
}

/** MCP servers the GitHub flow may need: `github` is required, `chrome` optional. */
const GITHUB_MCP: Array<{ name: string; required: boolean; aliases: string[] }> = [
  { name: 'github', required: true, aliases: ['github'] },
  { name: 'chrome', required: false, aliases: ['chrome', 'chrome-devtools', 'claude-in-chrome'] },
];

export interface BuildRequirementsInput {
  githubEnabled: boolean;
  /** Preflight checks to record (only the github-relevant ones are kept). */
  checks: PreflightCheck[];
  /** MCP server names declared in the project (from `scanMcpServers`). */
  mcpServers: string[];
}

/** GitHub-relevant preflight check ids, recorded into the manifest. */
const GITHUB_CHECK_IDS = new Set(['git', 'git-repo', 'git-remote', 'gh', 'gh-auth']);

export function buildRequirements(input: BuildRequirementsInput): Requirements {
  const declared = new Set(input.mcpServers);
  const checks: Record<string, string> = {};
  for (const c of input.checks) {
    if (GITHUB_CHECK_IDS.has(c.id)) checks[c.id] = c.ok ? 'ok' : 'missing';
  }
  const mcp = GITHUB_MCP.map((m) => ({
    name: m.name,
    required: m.required,
    configured: m.aliases.some((a) => declared.has(a)),
  }));

  return RequirementsSchema.parse({
    generatedBy: PSCODE_VERSION,
    github: {
      enabled: input.githubEnabled,
      checks,
      mcp,
    },
  });
}

export function readRequirements(projectRoot: string): Requirements | null {
  const raw = readFile(getRequirementsPath(projectRoot));
  if (raw === null) return null;
  try {
    return RequirementsSchema.parse(parseYaml(raw) ?? {});
  } catch {
    return null;
  }
}

export function writeRequirements(projectRoot: string, requirements: Requirements): void {
  const header =
    '# PSCode requirements manifest — written by `pscode init`.\n' +
    '# What each active integration needs, and what init verified. The agent\n' +
    '# reads this instead of re-probing; `configured` ≠ live MCP connection.\n';
  writeFile(getRequirementsPath(projectRoot), header + stringifyYaml(requirements));
}
