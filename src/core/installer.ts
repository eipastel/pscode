/**
 * Installer — writes the rails into a project.
 *
 * PSCode's whole job lives here: lay down the slash commands and skills for
 * each selected agent, the change templates, and the minimal `pscode/`
 * structure. The agent does the rest.
 */

import path from 'path';
import * as fs from 'fs';
import { getAdapter } from './adapters.js';
import { COMMANDS, SKILLS, CHANGE_TEMPLATES } from './content/index.js';
import { PSCODE_DIR } from './config.js';
import { exists, readFile, removeDir, removeDirIfEmpty, removeFile, writeFile } from './fs-utils.js';

/** Absolute paths of every command + skill file an agent owns. */
function agentArtifactPaths(projectRoot: string, agentId: string): string[] {
  const adapter = getAdapter(agentId);
  return [
    ...COMMANDS.map((c) => path.join(projectRoot, adapter.commandPath(c.id))),
    ...SKILLS.map((s) => path.join(projectRoot, adapter.skillPath(s.name))),
  ];
}

/**
 * Wipe the PSCode-owned folders for an agent so a fresh install leaves no stale
 * files behind (e.g. a command or skill removed/renamed in a newer version).
 * The whole `commands/ps/` namespace and every `skills/pscode-*` folder belong
 * to PSCode; user content lives outside them.
 */
function cleanAgentArtifacts(projectRoot: string, agentId: string): void {
  const adapter = getAdapter(agentId);
  removeDir(path.join(projectRoot, adapter.dir, 'commands', 'ps'));

  const skillsDir = path.join(projectRoot, adapter.dir, 'skills');
  if (exists(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith('pscode-')) {
        removeDir(path.join(skillsDir, entry.name));
      }
    }
  }
}

/**
 * Write all command + skill files for one agent. Returns relative paths written.
 *
 * `prFlow` (default on) selects which shape of the dev flow gets rendered — the
 * pull-request flow or the commit-directly one (see `content/flags.ts`).
 */
export function installAgent(
  projectRoot: string,
  agentId: string,
  opts: { prFlow?: boolean } = {}
): string[] {
  const adapter = getAdapter(agentId);
  const flags = { pr: opts.prFlow ?? true };
  const written: string[] = [];

  // Start clean so renamed/removed artifacts don't linger across updates.
  cleanAgentArtifacts(projectRoot, agentId);

  for (const cmd of COMMANDS) {
    const rel = adapter.commandPath(cmd.id);
    writeFile(path.join(projectRoot, rel), adapter.renderCommand(cmd, flags));
    written.push(rel);
  }
  for (const skill of SKILLS) {
    const rel = adapter.skillPath(skill.name);
    writeFile(path.join(projectRoot, rel), adapter.renderSkill(skill, flags));
    written.push(rel);
  }
  return written;
}

/** Reference change templates, copied into `pscode/templates/`. */
export function installChangeTemplates(projectRoot: string): string[] {
  const written: string[] = [];
  for (const tpl of CHANGE_TEMPLATES) {
    const rel = path.join(PSCODE_DIR, 'templates', tpl.file);
    writeFile(path.join(projectRoot, rel), tpl.content);
    written.push(rel);
  }
  return written;
}

/** Ensure `pscode/` and `pscode/changes/` exist. */
export function ensureProjectStructure(projectRoot: string): void {
  fs.mkdirSync(path.join(projectRoot, PSCODE_DIR, 'changes'), { recursive: true });
}

/**
 * Read the installed PSCode version for an agent from the first skill's
 * `generatedBy` frontmatter. Returns null if the agent isn't installed.
 */
export function installedVersion(projectRoot: string, agentId: string): string | null {
  const adapter = getAdapter(agentId);
  for (const skill of SKILLS) {
    const content = readFile(path.join(projectRoot, adapter.skillPath(skill.name)));
    if (content === null) continue;
    const m = content.match(/^generatedBy:\s*["']?([^"'\n]+)["']?\s*$/m);
    return m ? m[1].trim() : null;
  }
  return null;
}

/** True if an agent has at least one command or skill file installed. */
export function isAgentInstalled(projectRoot: string, agentId: string): boolean {
  return agentArtifactPaths(projectRoot, agentId).some((p) => exists(p));
}

/** Count how many of an agent's artifact files are present. */
export function agentArtifactStatus(projectRoot: string, agentId: string): {
  present: number;
  total: number;
} {
  const paths = agentArtifactPaths(projectRoot, agentId);
  return { present: paths.filter((p) => exists(p)).length, total: paths.length };
}

/** Remove an agent's command + skill files and prune now-empty PSCode dirs. */
export function removeAgent(projectRoot: string, agentId: string): string[] {
  const adapter = getAdapter(agentId);
  const removed: string[] = [];

  for (const p of agentArtifactPaths(projectRoot, agentId)) {
    if (removeFile(p)) removed.push(path.relative(projectRoot, p));
  }
  // Prune skill subdirectories, then the ps command dir, then empty parents.
  for (const skill of SKILLS) {
    removeDirIfEmpty(path.join(projectRoot, adapter.dir, 'skills', skill.name));
  }
  removeDirIfEmpty(path.join(projectRoot, adapter.dir, 'commands', 'ps'));
  removeDirIfEmpty(path.join(projectRoot, adapter.dir, 'skills'));
  removeDirIfEmpty(path.join(projectRoot, adapter.dir, 'commands'));
  return removed;
}

/** Remove the entire `pscode/` directory (including user changes). */
export function removePscodeDir(projectRoot: string): boolean {
  return removeDir(path.join(projectRoot, PSCODE_DIR));
}
