/**
 * Manage the PSCode block inside the agents' instruction files.
 *
 * Each agent reads its own file (Claude Code → CLAUDE.md, the others →
 * AGENTS.md); PSCode writes the managed block into the files the selected
 * agents read. PSCode owns only the text between its markers — everything the
 * user wrote outside the block is preserved on update; only the block is
 * rewritten.
 */

import path from 'path';
import { MANAGED_MARKERS, instructionFilesFor } from './config.js';
import { AGENTS_BLOCK_BODY } from './content/index.js';
import { readFile, writeFile } from './fs-utils.js';

/** Every instruction file PSCode may manage (used when removing the block). */
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

/** Insert/refresh the managed block in the instruction file(s) the agents read. */
export function syncInstructionFiles(projectRoot: string, agentIds: string[]): string[] {
  const files = instructionFilesFor(agentIds);
  for (const name of files) {
    upsertManagedBlock(path.join(projectRoot, name));
  }
  return files;
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

/** True if a single file contains the managed block. */
function fileHasBlock(filePath: string): boolean {
  const content = readFile(filePath);
  return content !== null && blockRegex().test(content);
}

/** True if every instruction file the given agents read has the managed block. */
export function hasManagedBlock(projectRoot: string, agentIds: string[]): boolean {
  return instructionFilesFor(agentIds).every((name) =>
    fileHasBlock(path.join(projectRoot, name))
  );
}
