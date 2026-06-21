import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import {
  syncInstructionFiles,
  removeManagedBlock,
  hasManagedBlock,
} from '../../src/core/agents-md';
import { MANAGED_MARKERS } from '../../src/core/config';
import { makeTmpProject, cleanup } from '../helpers/tmp';

describe('managed instruction block', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('writes CLAUDE.md for Claude Code', () => {
    dir = makeTmpProject();
    const touched = syncInstructionFiles(dir, ['claude']);
    expect(touched).toEqual(['CLAUDE.md']);
    expect(existsSync(path.join(dir, 'AGENTS.md'))).toBe(false);
    expect(hasManagedBlock(dir, ['claude'])).toBe(true);
  });

  it('writes AGENTS.md for the other agents', () => {
    dir = makeTmpProject();
    const touched = syncInstructionFiles(dir, ['codex']);
    expect(touched).toEqual(['AGENTS.md']);
    expect(hasManagedBlock(dir, ['codex'])).toBe(true);
  });

  it('writes both files when Claude is mixed with another agent', () => {
    dir = makeTmpProject();
    const touched = syncInstructionFiles(dir, ['claude', 'cursor']);
    expect(touched).toContain('CLAUDE.md');
    expect(touched).toContain('AGENTS.md');
    expect(hasManagedBlock(dir, ['claude', 'cursor'])).toBe(true);
  });

  it('preserves user content and is idempotent', () => {
    dir = makeTmpProject();
    const agentsPath = path.join(dir, 'AGENTS.md');
    writeFileSync(agentsPath, '# My Project\n\nKeep me.\n');

    syncInstructionFiles(dir, ['codex']);
    const first = readFileSync(agentsPath, 'utf-8');
    expect(first).toContain('Keep me.');
    expect(first).toContain(MANAGED_MARKERS.start);

    syncInstructionFiles(dir, ['codex']);
    const second = readFileSync(agentsPath, 'utf-8');
    // Idempotent: exactly one block.
    expect(second.match(new RegExp(MANAGED_MARKERS.start, 'g'))?.length).toBe(1);
    expect(second).toContain('Keep me.');
  });

  it('removes the block while keeping user content', () => {
    dir = makeTmpProject();
    const claudePath = path.join(dir, 'CLAUDE.md');
    writeFileSync(claudePath, '# My Project\n\nKeep me.\n');
    syncInstructionFiles(dir, ['claude']);

    const removed = removeManagedBlock(dir);
    expect(removed).toContain('CLAUDE.md');
    expect(hasManagedBlock(dir, ['claude'])).toBe(false);
    expect(readFileSync(claudePath, 'utf-8')).toContain('Keep me.');
  });
});
