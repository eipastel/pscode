/**
 * Orphan Artifact Pruning
 *
 * Removes Pscode-managed skill directories and slash command files that no
 * longer correspond to a desired workflow, by **scanning the filesystem**
 * rather than iterating `ALL_WORKFLOWS`. This is what lets `init`/`update`
 * clean up artifacts of workflows that were deleted (or renamed) from the
 * enum entirely — a loop over `ALL_WORKFLOWS` would never visit them.
 *
 * The "desired" set is computed from the same generators used when writing
 * (`getSkillTemplates` / `adapter.getFilePath`), so there is a single source
 * of truth and a valid artifact is never removed.
 *
 * Removal is strictly limited to Pscode-managed naming patterns (skill dirs
 * prefixed `pscode-`; command files matching the adapter's own filename
 * pattern), so user files are preserved.
 */

import path from 'path';
import * as fs from 'fs';
import { CommandAdapterRegistry } from '../command-generation/index.js';
import { AI_TOOLS } from '../config.js';
import type { Delivery } from '../global-config.js';
import { getSkillTemplates } from './skill-generation.js';

const SKILL_DIR_PREFIX = 'pscode-';
/** Sentinel unlikely to collide with a real command id. */
const PROBE_ID = '__pscode_probe__';

export interface PruneResult {
  removedSkillDirs: number;
  removedCommandFiles: number;
}

/**
 * Lists the immediate child directory names of `dir`, or `[]` if it doesn't exist.
 */
function listDirs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Lists the immediate child file names of `dir`, or `[]` if it doesn't exist.
 */
function listFiles(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Derives the command directory and the Pscode-managed filename pattern for an
 * adapter by probing `getFilePath` with a sentinel id. Returns the directory,
 * the filename prefix/suffix that wrap the id, and a decoder from filename → id.
 */
function resolveCommandPattern(
  toolId: string,
  projectPath: string
): { dir: string; prefix: string; suffix: string; idFromFile: (file: string) => string | null } | null {
  const adapter = CommandAdapterRegistry.get(toolId);
  if (!adapter) return null;

  const probePath = adapter.getFilePath(PROBE_ID);
  const absProbe = path.isAbsolute(probePath) ? probePath : path.join(projectPath, probePath);
  const dir = path.dirname(absProbe);
  const base = path.basename(absProbe);
  const idx = base.indexOf(PROBE_ID);
  if (idx === -1) return null;

  const prefix = base.slice(0, idx);
  const suffix = base.slice(idx + PROBE_ID.length);

  const idFromFile = (file: string): string | null => {
    if (!file.startsWith(prefix) || !file.endsWith(suffix)) return null;
    const id = file.slice(prefix.length, file.length - suffix.length);
    return id.length > 0 ? id : null;
  };

  return { dir, prefix, suffix, idFromFile };
}

/**
 * Scans installed Pscode artifacts for a single tool and removes orphans —
 * artifacts that do not belong to a desired workflow for the active delivery.
 *
 * - Skills: every `pscode-*` directory whose name is not in the desired set is
 *   removed. When skills are not generated (commands-only delivery) the desired
 *   set is empty, so all Pscode skill dirs are removed.
 * - Commands: every Pscode-managed command file whose decoded id is not in the
 *   desired set is removed. When commands are not generated (skills-only) the
 *   desired set is empty, so all managed command files are removed.
 */
export function pruneOrphansForTool(
  projectPath: string,
  toolId: string,
  desiredWorkflows: readonly string[],
  delivery: Delivery,
  extraCommandIds: readonly string[] = []
): PruneResult {
  const tool = AI_TOOLS.find((t) => t.value === toolId);
  if (!tool?.skillsDir) return { removedSkillDirs: 0, removedCommandFiles: 0 };

  const shouldGenerateSkills = delivery !== 'commands';
  const shouldGenerateCommands = delivery !== 'skills';

  let removedSkillDirs = 0;
  let removedCommandFiles = 0;

  // ── Skills ──────────────────────────────────────────────────────────────
  const skillsDir = path.join(projectPath, tool.skillsDir, 'skills');
  const desiredSkillDirs = new Set(
    shouldGenerateSkills ? getSkillTemplates(desiredWorkflows).map((t) => t.dirName) : []
  );

  for (const name of listDirs(skillsDir)) {
    if (!name.startsWith(SKILL_DIR_PREFIX)) continue; // never touch user dirs
    if (desiredSkillDirs.has(name)) continue;
    try {
      fs.rmSync(path.join(skillsDir, name), { recursive: true, force: true });
      removedSkillDirs++;
    } catch {
      // Ignore errors
    }
  }

  // ── Commands ────────────────────────────────────────────────────────────
  const pattern = resolveCommandPattern(toolId, projectPath);
  if (pattern) {
    const desiredCommandIds = new Set<string>(
      shouldGenerateCommands ? [...desiredWorkflows, ...extraCommandIds] : []
    );
    for (const file of listFiles(pattern.dir)) {
      const id = pattern.idFromFile(file);
      if (id == null) continue; // not a Pscode-managed command file
      if (desiredCommandIds.has(id)) continue;
      try {
        fs.unlinkSync(path.join(pattern.dir, file));
        removedCommandFiles++;
      } catch {
        // Ignore errors
      }
    }
  }

  return { removedSkillDirs, removedCommandFiles };
}

/**
 * Removes the legacy `.claude/commands/pstld/` directory in its entirety.
 *
 * The `/pstld:*` namespace was removed once its capabilities were absorbed into
 * the `/ps:*` overrides. The generic per-id pruner only scans individual command
 * files within a known command dir — it never removes a whole namespace subdir —
 * so this targets the legacy directory explicitly. No-op when it doesn't exist;
 * best-effort (never throws). Returns `true` when a directory was removed.
 */
export function pruneLegacyPstldCommands(projectPath: string): boolean {
  const pstldDir = path.join(projectPath, '.claude', 'commands', 'pstld');
  try {
    if (fs.existsSync(pstldDir)) {
      fs.rmSync(pstldDir, { recursive: true, force: true });
      return true;
    }
  } catch {
    // Best-effort: never block update/init on cleanup.
  }
  return false;
}

/**
 * Prunes orphan artifacts across multiple tools, aggregating the counts.
 */
export function pruneOrphans(
  projectPath: string,
  toolIds: readonly string[],
  desiredWorkflows: readonly string[],
  delivery: Delivery,
  extraCommandIds: readonly string[] = []
): PruneResult {
  let removedSkillDirs = 0;
  let removedCommandFiles = 0;

  for (const toolId of toolIds) {
    const result = pruneOrphansForTool(projectPath, toolId, desiredWorkflows, delivery, extraCommandIds);
    removedSkillDirs += result.removedSkillDirs;
    removedCommandFiles += result.removedCommandFiles;
  }

  return { removedSkillDirs, removedCommandFiles };
}
