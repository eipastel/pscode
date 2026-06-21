import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import {
  installAgent,
  removeAgent,
  installedVersion,
  isAgentInstalled,
  agentArtifactStatus,
  installChangeTemplates,
} from '../../src/core/installer';
import { listChanges } from '../../src/core/changes';
import { PSCODE_VERSION } from '../../src/core/config';
import { makeTmpProject, cleanup } from '../helpers/tmp';

describe('installer', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  it('installs all command and skill files for an agent', () => {
    dir = makeTmpProject();
    const written = installAgent(dir, 'claude');
    expect(written.length).toBe(12); // 8 commands + 4 skills
    expect(existsSync(path.join(dir, '.claude/commands/ps/do.md'))).toBe(true);
    expect(existsSync(path.join(dir, '.claude/skills/pscode-guided-sdd/SKILL.md'))).toBe(true);
    expect(isAgentInstalled(dir, 'claude')).toBe(true);

    const status = agentArtifactStatus(dir, 'claude');
    expect(status.present).toBe(status.total);
    expect(installedVersion(dir, 'claude')).toBe(PSCODE_VERSION);
  });

  it('removes an agent and prunes empty directories', () => {
    dir = makeTmpProject();
    installAgent(dir, 'claude');
    const removed = removeAgent(dir, 'claude');
    expect(removed.length).toBe(12);
    expect(existsSync(path.join(dir, '.claude/commands/ps'))).toBe(false);
    expect(isAgentInstalled(dir, 'claude')).toBe(false);
  });

  it('writes the change templates under pscode/templates', () => {
    dir = makeTmpProject();
    const written = installChangeTemplates(dir);
    expect(written.length).toBe(5);
    expect(existsSync(path.join(dir, 'pscode/templates/brief.md'))).toBe(true);
  });
});

describe('change state derivation', () => {
  let dir: string;
  afterEach(() => dir && cleanup(dir));

  function change(slug: string, files: Record<string, string>): void {
    const cdir = path.join(dir, 'pscode', 'changes', slug);
    mkdirSync(cdir, { recursive: true });
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(path.join(cdir, name), content);
    }
  }

  it('derives a state per change from artifacts and task progress', () => {
    dir = makeTmpProject();
    change('a-draft', { 'brief.md': '# x' });
    change('b-spec', { 'brief.md': '# x', 'questions.md': '# q' });
    change('c-ready', { 'design.md': '# d', 'tasks.md': '- [ ] one' });
    change('d-doing', { 'tasks.md': '- [x] one\n- [ ] two' });
    change('e-review', { 'tasks.md': '- [x] one' });
    change('f-done', { 'tasks.md': '- [x] one', 'review.md': '# r' });

    const bySlug = Object.fromEntries(listChanges(dir).map((c) => [c.slug, c.state]));
    expect(bySlug['a-draft']).toBe('draft');
    expect(bySlug['b-spec']).toBe('spec-review');
    expect(bySlug['c-ready']).toBe('ready');
    expect(bySlug['d-doing']).toBe('doing');
    expect(bySlug['e-review']).toBe('review');
    expect(bySlug['f-done']).toBe('done');
  });

  it('returns an empty list when there are no changes', () => {
    dir = makeTmpProject();
    expect(listChanges(dir)).toEqual([]);
  });
});
