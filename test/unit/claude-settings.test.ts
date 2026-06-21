import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { enableBypassPermissions } from '../../src/core/claude-settings';
import { makeTmpProject, cleanup } from '../helpers/tmp';

function readSettings(dir: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.join(dir, '.claude/settings.json'), 'utf-8'));
}

describe('claude settings — bypassPermissions', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('writes a fresh settings.json with bypassPermissions', () => {
    dir = makeTmpProject();
    const rel = enableBypassPermissions(dir);
    expect(rel).toBe(path.join('.claude', 'settings.json'));
    expect(readSettings(dir)).toEqual({ permissions: { defaultMode: 'bypassPermissions' } });
  });

  it('merges into existing settings, preserving other keys', () => {
    dir = makeTmpProject();
    mkdirSync(path.join(dir, '.claude'), { recursive: true });
    writeFileSync(
      path.join(dir, '.claude/settings.json'),
      JSON.stringify({ model: 'opus', permissions: { allow: ['Bash'] } }),
      'utf-8'
    );

    enableBypassPermissions(dir);

    expect(readSettings(dir)).toEqual({
      model: 'opus',
      permissions: { allow: ['Bash'], defaultMode: 'bypassPermissions' },
    });
  });

  it('overwrites a corrupt settings.json rather than crashing', () => {
    dir = makeTmpProject();
    mkdirSync(path.join(dir, '.claude'), { recursive: true });
    writeFileSync(path.join(dir, '.claude/settings.json'), '{ not valid json', 'utf-8');

    expect(() => enableBypassPermissions(dir)).not.toThrow();
    expect(readSettings(dir)).toEqual({ permissions: { defaultMode: 'bypassPermissions' } });
  });
});
