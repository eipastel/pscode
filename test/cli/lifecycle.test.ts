import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { runCLI } from '../helpers/run-cli';
import { makeTmpProject, cleanup } from '../helpers/tmp';

describe('pscode CLI lifecycle', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('init creates the guided structure', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(0);

    expect(existsSync(path.join(dir, 'pscode/config.yaml'))).toBe(true);
    expect(existsSync(path.join(dir, 'pscode/changes'))).toBe(true);
    expect(existsSync(path.join(dir, '.claude/commands/ps/draft.md'))).toBe(true);
    expect(existsSync(path.join(dir, '.claude/skills/pscode-guided-sdd/SKILL.md'))).toBe(true);
    // Claude Code reads CLAUDE.md; no AGENTS.md for a Claude-only project.
    expect(readFileSync(path.join(dir, 'CLAUDE.md'), 'utf-8')).toContain('PSCODE:START');
    expect(existsSync(path.join(dir, 'AGENTS.md'))).toBe(false);
  });

  it('init writes bypassPermissions by default in non-interactive mode', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(0);

    const settings = JSON.parse(readFileSync(path.join(dir, '.claude/settings.json'), 'utf-8'));
    expect(settings.permissions.defaultMode).toBe('bypassPermissions');
  });

  it('init --no-bypass-permissions skips the settings file', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--agent', 'claude', '--no-bypass-permissions', '--yes'], {
      cwd: dir,
    });
    expect(res.exitCode).toBe(0);
    expect(existsSync(path.join(dir, '.claude/settings.json'))).toBe(false);
  });

  it('init does not write Claude settings when only non-Claude agents are selected', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--agent', 'codex', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    expect(existsSync(path.join(dir, '.claude/settings.json'))).toBe(false);
  });

  it('without a terminal, init hints how to open the agent (Claude preferred)', async () => {
    dir = makeTmpProject();
    // Piped stdio (no TTY) — the agent is never launched, only hinted.
    const res = await runCLI(['init', '--agent', 'gemini', '--agent', 'claude', '--yes'], {
      cwd: dir,
    });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('Run `claude`');
  });

  it('init --no-open does not hint or launch an agent', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--agent', 'claude', '--no-open', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).not.toContain('Run `claude`');
  });

  it('init rejects an unknown agent', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--agent', 'nope', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(1);
    expect(res.stderr).toContain('Unknown agent');
  });

  it('localizes the wizard output (pt) but keeps installed content in English', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--lang', 'pt', '--agent', 'claude', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('inicializado');
    expect(res.stdout).toContain('Agentes:');
    // The language only affects the wizard; installed content stays English.
    const skill = readFileSync(path.join(dir, '.claude/skills/pscode-guided-sdd/SKILL.md'), 'utf-8');
    expect(skill).toContain('Non-negotiable rules');
  });

  it('init rejects an unknown language', async () => {
    dir = makeTmpProject();
    const res = await runCLI(['init', '--lang', 'xx', '--yes'], { cwd: dir });
    expect(res.exitCode).toBe(1);
    expect(res.stderr).toContain('Unknown language');
  });

  it('doctor passes on a fresh init and reports issues otherwise', async () => {
    dir = makeTmpProject();
    const before = await runCLI(['doctor'], { cwd: dir });
    expect(before.exitCode).toBe(1); // no config yet

    await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });
    const after = await runCLI(['doctor'], { cwd: dir });
    expect(after.exitCode).toBe(0);
    expect(after.stdout).toContain('Everything looks good');
  });

  it('update preserves user changes and the config', async () => {
    dir = makeTmpProject();
    await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });

    const userChange = path.join(dir, 'pscode/changes/my-change/brief.md');
    mkdirSync(path.dirname(userChange), { recursive: true });
    writeFileSync(userChange, '# my change\n');

    const res = await runCLI(['update'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    expect(existsSync(userChange)).toBe(true);
    expect(existsSync(path.join(dir, '.claude/skills/pscode-guided-sdd/SKILL.md'))).toBe(true);
  });

  it('update wipes stale PSCode commands and skills', async () => {
    dir = makeTmpProject();
    await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });

    // Simulate artifacts from an older version that no longer exist.
    const staleCmd = path.join(dir, '.claude/commands/ps/old.md');
    const staleSkill = path.join(dir, '.claude/skills/pscode-old/SKILL.md');
    writeFileSync(staleCmd, '# old\n');
    mkdirSync(path.dirname(staleSkill), { recursive: true });
    writeFileSync(staleSkill, '# old skill\n');

    const res = await runCLI(['update'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    // Stale artifacts are gone; current ones are rewritten.
    expect(existsSync(staleCmd)).toBe(false);
    expect(existsSync(path.join(dir, '.claude/skills/pscode-old'))).toBe(false);
    expect(existsSync(path.join(dir, '.claude/commands/ps/draft.md'))).toBe(true);
    expect(existsSync(path.join(dir, '.claude/skills/pscode-guided-sdd/SKILL.md'))).toBe(true);
  });

  it('status lists changes with a derived state', async () => {
    dir = makeTmpProject();
    await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });
    const cdir = path.join(dir, 'pscode/changes/add-search-type');
    mkdirSync(cdir, { recursive: true });
    writeFileSync(path.join(cdir, 'brief.md'), '# Add search type\n');

    const res = await runCLI(['status'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('add-search-type');
    expect(res.stdout).toContain('draft');
  });

  it('clean --yes removes rails but keeps user changes; --all removes pscode/', async () => {
    dir = makeTmpProject();
    await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });
    const cdir = path.join(dir, 'pscode/changes/keep-me');
    mkdirSync(cdir, { recursive: true });
    writeFileSync(path.join(cdir, 'brief.md'), '# keep\n');

    const clean = await runCLI(['clean', '--yes'], { cwd: dir });
    expect(clean.exitCode).toBe(0);
    expect(existsSync(path.join(dir, '.claude/commands/ps/draft.md'))).toBe(false);
    expect(existsSync(path.join(cdir, 'brief.md'))).toBe(true); // user change kept
    expect(existsSync(path.join(dir, 'pscode/templates'))).toBe(false);

    const cleanAll = await runCLI(['clean', '--all', '--yes'], { cwd: dir });
    expect(cleanAll.exitCode).toBe(0);
    expect(existsSync(path.join(dir, 'pscode'))).toBe(false);
  });

  it('clean without --yes is a no-op in non-interactive mode', async () => {
    dir = makeTmpProject();
    await runCLI(['init', '--agent', 'claude', '--yes'], { cwd: dir });
    const res = await runCLI(['clean'], { cwd: dir });
    expect(res.exitCode).toBe(0);
    expect(existsSync(path.join(dir, '.claude/commands/ps/draft.md'))).toBe(true);
  });
});
