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
    expect(written.length).toBe(15); // 6 commands + 9 skills
    expect(existsSync(path.join(dir, '.claude/commands/ps/draft.md'))).toBe(true);
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
    expect(removed.length).toBe(15);
    expect(existsSync(path.join(dir, '.claude/commands/ps'))).toBe(false);
    expect(isAgentInstalled(dir, 'claude')).toBe(false);
  });

  it('writes the change templates under pscode/templates', () => {
    dir = makeTmpProject();
    const written = installChangeTemplates(dir);
    expect(written.length).toBe(4);
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

  it('derives a state per change from refine.md and subtask progress', () => {
    dir = makeTmpProject();
    change('a-draft', { 'brief.md': '# x' });
    change('b-still-draft', { 'brief.md': '# x', 'questions.md': '# q' });
    change('c-refined', { 'refine.md': '## Subtasks\n- [ ] one\n- [ ] two' });
    change('d-doing', { 'refine.md': '## Subtasks\n- [x] one\n- [ ] two' });
    change('e-review', { 'refine.md': '## Subtasks\n- [x] one\n- [x] two' });

    const bySlug = Object.fromEntries(listChanges(dir).map((c) => [c.slug, c.state]));
    expect(bySlug['a-draft']).toBe('draft');
    expect(bySlug['b-still-draft']).toBe('draft');
    expect(bySlug['c-refined']).toBe('refined');
    expect(bySlug['d-doing']).toBe('doing');
    expect(bySlug['e-review']).toBe('review');
  });

  it('returns an empty list when there are no changes', () => {
    dir = makeTmpProject();
    expect(listChanges(dir)).toEqual([]);
  });
});
