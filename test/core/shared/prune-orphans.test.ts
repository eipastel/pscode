import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { pruneLegacyPstldCommands } from '../../../src/core/shared/prune-orphans.js';

describe('pruneLegacyPstldCommands', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pscode-prune-pstld-'));
  });

  afterEach(() => {
    fs.rmSync(projectDir, { recursive: true, force: true });
  });

  it('removes the entire .claude/commands/pstld/ directory when present', () => {
    const pstldDir = path.join(projectDir, '.claude', 'commands', 'pstld');
    fs.mkdirSync(pstldDir, { recursive: true });
    fs.writeFileSync(path.join(pstldDir, 'jira-draft.md'), '# legacy');
    fs.writeFileSync(path.join(pstldDir, 'adr.md'), '# legacy');

    // Sibling /ps namespace must survive.
    const psDir = path.join(projectDir, '.claude', 'commands', 'ps');
    fs.mkdirSync(psDir, { recursive: true });
    fs.writeFileSync(path.join(psDir, 'propose.md'), '# ps');

    expect(pruneLegacyPstldCommands(projectDir)).toBe(true);
    expect(fs.existsSync(pstldDir)).toBe(false);
    expect(fs.existsSync(path.join(psDir, 'propose.md'))).toBe(true);
  });

  it('is a no-op (returns false) when there is no pstld directory', () => {
    expect(pruneLegacyPstldCommands(projectDir)).toBe(false);
  });
});
