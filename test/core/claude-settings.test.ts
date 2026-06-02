import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import { ensureClaudeBypassPermissions } from '../../src/core/claude-settings.js';

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'claude-settings-test-'));
}

function readSettings(projectDir: string): Record<string, unknown> {
  const settingsPath = path.join(projectDir, '.claude', 'settings.local.json');
  return JSON.parse(fsSync.readFileSync(settingsPath, 'utf-8')) as Record<string, unknown>;
}

describe('ensureClaudeBypassPermissions', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await makeTempDir();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('3.1 — arquivo ausente → cria settings.local.json com defaultMode bypassPermissions', () => {
    ensureClaudeBypassPermissions(dir);

    const settingsPath = path.join(dir, '.claude', 'settings.local.json');
    expect(fsSync.existsSync(settingsPath)).toBe(true);
    const settings = readSettings(dir);
    expect((settings.permissions as Record<string, unknown>).defaultMode).toBe('bypassPermissions');
  });

  it('3.2 — arquivo existente com outras chaves → adiciona defaultMode preservando o restante', () => {
    const claudeDir = path.join(dir, '.claude');
    fsSync.mkdirSync(claudeDir, { recursive: true });
    fsSync.writeFileSync(
      path.join(claudeDir, 'settings.local.json'),
      JSON.stringify({
        env: { FOO: 'bar' },
        permissions: { allow: ['Bash(ls:*)'] },
      }, null, 2)
    );

    ensureClaudeBypassPermissions(dir);

    const settings = readSettings(dir);
    expect(settings.env).toEqual({ FOO: 'bar' });
    const permissions = settings.permissions as Record<string, unknown>;
    expect(permissions.allow).toEqual(['Bash(ls:*)']);
    expect(permissions.defaultMode).toBe('bypassPermissions');
  });

  it('3.3 — defaultMode divergente → sobrescrito para bypassPermissions', () => {
    const claudeDir = path.join(dir, '.claude');
    fsSync.mkdirSync(claudeDir, { recursive: true });
    fsSync.writeFileSync(
      path.join(claudeDir, 'settings.local.json'),
      JSON.stringify({ permissions: { defaultMode: 'plan' } }, null, 2)
    );

    ensureClaudeBypassPermissions(dir);

    const settings = readSettings(dir);
    expect((settings.permissions as Record<string, unknown>).defaultMode).toBe('bypassPermissions');
  });

  it('3.4 — JSON inválido → recriado de forma resiliente sem lançar', () => {
    const claudeDir = path.join(dir, '.claude');
    fsSync.mkdirSync(claudeDir, { recursive: true });
    fsSync.writeFileSync(path.join(claudeDir, 'settings.local.json'), 'not-valid-json{{{');

    const consoleSpy = vi.spyOn(console, 'log');
    expect(() => ensureClaudeBypassPermissions(dir)).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('settings.local.json inválido'));
    const settings = readSettings(dir);
    expect((settings.permissions as Record<string, unknown>).defaultMode).toBe('bypassPermissions');
  });
});
