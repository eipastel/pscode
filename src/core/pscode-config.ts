/**
 * `pscode/config.yaml` — the single source of truth for a PSCode project.
 *
 * Intentionally small: which agents are installed, the short-document limits,
 * and the two guardrails the workflow enforces.
 */

import path from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import { DEFAULT_LIMITS, DEFAULT_PROFILE, PSCODE_DIR, PSCODE_VERSION } from './config.js';
import { exists, readFile, writeFile } from './fs-utils.js';

const ConfigSchema = z.object({
  version: z.string().default(PSCODE_VERSION),
  profile: z.string().default(DEFAULT_PROFILE),
  agents: z.array(z.string()).default([]),
  limits: z
    .object({
      max_brief_lines: z.number().default(DEFAULT_LIMITS.max_brief_lines),
      max_design_lines: z.number().default(DEFAULT_LIMITS.max_design_lines),
      max_questions: z.number().default(DEFAULT_LIMITS.max_questions),
    })
    .default({ ...DEFAULT_LIMITS }),
  apply_mode: z.string().default('one_task_at_a_time'),
  approval_required: z.boolean().default(true),
  // Whether the dev step uses a pull-request flow (draft PR per change) or
  // commits directly to the current branch. Drives which shape of the dev
  // commands/skills gets installed. Defaults on to preserve prior behavior.
  pr_flow: z.boolean().default(true),
  github: z
    .object({
      enabled: z.boolean().default(false),
    })
    .default({ enabled: false }),
});

export type PscodeConfig = z.infer<typeof ConfigSchema>;

function configPath(projectRoot: string): string {
  return path.join(projectRoot, PSCODE_DIR, 'config.yaml');
}

export function configExists(projectRoot: string): boolean {
  return exists(configPath(projectRoot));
}

export function buildConfig(opts: {
  agents: string[];
  githubEnabled?: boolean;
  prFlow?: boolean;
}): PscodeConfig {
  return ConfigSchema.parse({
    version: PSCODE_VERSION,
    profile: DEFAULT_PROFILE,
    agents: opts.agents,
    limits: { ...DEFAULT_LIMITS },
    apply_mode: 'one_task_at_a_time',
    approval_required: true,
    pr_flow: opts.prFlow ?? true,
    github: { enabled: opts.githubEnabled ?? false },
  });
}

export function readConfig(projectRoot: string): PscodeConfig | null {
  const raw = readFile(configPath(projectRoot));
  if (raw === null) return null;
  try {
    return ConfigSchema.parse(parseYaml(raw) ?? {});
  } catch {
    return null;
  }
}

export function writeConfig(projectRoot: string, config: PscodeConfig): void {
  const header =
    '# PSCode configuration — guided SDD installer.\n' +
    '# See https://github.com/eipastel/pscode\n';
  writeFile(configPath(projectRoot), header + stringifyYaml(config));
}
