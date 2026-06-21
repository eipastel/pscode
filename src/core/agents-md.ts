/**
 * Manage the PSCode block inside AGENTS.md (and CLAUDE.md).
 *
 * PSCode owns only the text between its markers. Everything the user wrote
 * outside the block is preserved on update; only the block is rewritten.
 */

import path from 'path';
import { MANAGED_MARKERS } from './config.js';
import { AGENTS_BLOCK_BODY } from './content/index.js';
import { exists, readFile, writeFile } from './fs-utils.js';

/** Files PSCode keeps the managed block in. */
const MANAGED_INSTRUCTION_FILES = ['AGENTS.md', 'CLAUDE.md'] as const;

function block(): string {
  return `${MANAGED_MARKERS.start}\n${AGENTS_BLOCK_BODY}\n${MANAGED_MARKERS.end}`;
}

function blockRegex(): RegExp {
  const start = MANAGED_MARKERS.start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const end = MANAGED_MARKERS.end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${start}[\\s\\S]*?${end}`);
}

/** Insert or refresh the managed block in a single file. */
function upsertManagedBlock(filePath: string): void {
  const existing = readFile(filePath);
  if (existing === null) {
    writeFile(filePath, `${block()}\n`);
    return;
  }
  if (blockRegex().test(existing)) {
    writeFile(filePath, existing.replace(blockRegex(), block()));
    return;
  }
  const sep = existing.endsWith('\n') ? '\n' : '\n\n';
  writeFile(filePath, `${existing}${sep}${block()}\n`);
}

/** Insert/refresh the managed block in AGENTS.md (always) and CLAUDE.md (if present). */
export function syncInstructionFiles(projectRoot: string): string[] {
  const touched: string[] = [];
  const agentsPath = path.join(projectRoot, 'AGENTS.md');
  upsertManagedBlock(agentsPath);
  touched.push('AGENTS.md');

  const claudePath = path.join(projectRoot, 'CLAUDE.md');
  if (exists(claudePath)) {
    upsertManagedBlock(claudePath);
    touched.push('CLAUDE.md');
  }
  return touched;
}

/** Remove the managed block from instruction files. Returns files changed. */
export function removeManagedBlock(projectRoot: string): string[] {
  const touched: string[] = [];
  for (const name of MANAGED_INSTRUCTION_FILES) {
    const filePath = path.join(projectRoot, name);
    const content = readFile(filePath);
    if (content === null || !blockRegex().test(content)) continue;
    const cleaned = content.replace(blockRegex(), '').replace(/\n{3,}/g, '\n\n').trimEnd();
    writeFile(filePath, cleaned ? `${cleaned}\n` : '');
    touched.push(name);
  }
  return touched;
}

/** True if the managed block is present in AGENTS.md. */
export function hasManagedBlock(projectRoot: string): boolean {
  const content = readFile(path.join(projectRoot, 'AGENTS.md'));
  return content !== null && blockRegex().test(content);
}
