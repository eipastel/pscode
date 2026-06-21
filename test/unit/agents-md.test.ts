import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import {
  syncInstructionFiles,
  removeManagedBlock,
  hasManagedBlock,
} from '../../src/core/agents-md';
import { MANAGED_MARKERS } from '../../src/core/config';
import { makeTmpProject, cleanup } from '../helpers/tmp';

describe('AGENTS.md managed block', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('creates AGENTS.md with the block when none exists', () => {
    dir = makeTmpProject();
    const touched = syncInstructionFiles(dir);
    expect(touched).toContain('AGENTS.md');
    expect(hasManagedBlock(dir)).toBe(true);
  });

  it('preserves user content and is idempotent', () => {
    dir = makeTmpProject();
    const agentsPath = path.join(dir, 'AGENTS.md');
    writeFileSync(agentsPath, '# My Project\n\nKeep me.\n');

    syncInstructionFiles(dir);
    const first = readFileSync(agentsPath, 'utf-8');
    expect(first).toContain('Keep me.');
    expect(first).toContain(MANAGED_MARKERS.start);

    syncInstructionFiles(dir);
    const second = readFileSync(agentsPath, 'utf-8');
    // Idempotent: exactly one block.
    expect(second.match(new RegExp(MANAGED_MARKERS.start, 'g'))?.length).toBe(1);
    expect(second).toContain('Keep me.');
  });

  it('also updates CLAUDE.md when present', () => {
    dir = makeTmpProject();
    writeFileSync(path.join(dir, 'CLAUDE.md'), '# Claude rules\n');
    const touched = syncInstructionFiles(dir);
    expect(touched).toContain('CLAUDE.md');
  });

  it('removes the block while keeping user content', () => {
    dir = makeTmpProject();
    const agentsPath = path.join(dir, 'AGENTS.md');
    writeFileSync(agentsPath, '# My Project\n\nKeep me.\n');
    syncInstructionFiles(dir);

    const removed = removeManagedBlock(dir);
    expect(removed).toContain('AGENTS.md');
    expect(hasManagedBlock(dir)).toBe(false);
    expect(readFileSync(agentsPath, 'utf-8')).toContain('Keep me.');
  });
});
