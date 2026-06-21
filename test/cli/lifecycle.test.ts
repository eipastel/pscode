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
    expect(existsSync(path.join(dir, 'pscode/board.yaml'))).toBe(true);
    expect(existsSync(path.join(dir, 'pscode/changes'))).toBe(true);
    expect(existsSync(path.join(dir, '.claude/commands/ps/do.md'))).toBe(true);
    expect(existsSync(path.join(dir, '.claude/skills/pscode-guided-sdd/SKILL.md'))).toBe(true);
    expect(readFileSync(path.join(dir, 'AGENTS.md'), 'utf-8')).toContain('PSCODE:START');
  });

  it('init --no-board skips the board', async () => {
    dir = makeTmpProject();
    await runCLI(['init', '--agent', 'claude', '--yes', '--no-board'], { cwd: dir });
    expect(existsSync(path.join(dir, 'pscode/board.yaml'))).toBe(false);
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
    expect(existsSync(path.join(dir, '.claude/commands/ps/do.md'))).toBe(false);
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
    expect(existsSync(path.join(dir, '.claude/commands/ps/do.md'))).toBe(true);
  });
});
