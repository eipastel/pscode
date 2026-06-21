import { describe, it, expect } from 'vitest';
import { COMMANDS } from '../../src/core/content/commands';
import { SKILLS } from '../../src/core/content/skills';
import { CHANGE_TEMPLATES } from '../../src/core/content/change-templates';

describe('guided-SDD content', () => {
  it('ships the board-aligned slash commands plus board-setup', () => {
    expect(COMMANDS.map((c) => c.id)).toEqual([
      'draft',
      'refine',
      'dev',
      'complete',
      'cancel',
      'board-setup',
    ]);
    for (const cmd of COMMANDS) {
      expect(cmd.body.trim().length).toBeGreaterThan(0);
      expect(cmd.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('ships the nine skills', () => {
    expect(SKILLS.map((s) => s.name)).toEqual([
      'pscode-guided-sdd',
      'pscode-grill-me',
      'pscode-refine',
      'pscode-mini-spec',
      'pscode-task-runner',
      'pscode-dev',
      'pscode-complete',
      'pscode-github-sync',
      'pscode-board-setup',
    ]);
    for (const skill of SKILLS) {
      expect(skill.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('wires the GitHub sync into every state-changing command', () => {
    const byId = Object.fromEntries(COMMANDS.map((c) => [c.id, c.body]));
    for (const id of ['draft', 'refine', 'dev', 'complete', 'cancel']) {
      expect(byId[id]).toContain('pscode-github-sync');
      expect(byId[id]).toContain('pscode/github.yaml');
    }
    // board-setup configures the board itself — it doesn't drive a card's status.
    expect(byId['board-setup']).not.toContain('pscode-github-sync');
  });

  it('ships the four short change templates', () => {
    expect(CHANGE_TEMPLATES.map((t) => t.file)).toEqual([
      'brief.md',
      'questions.md',
      'refine.md',
      'delta-spec.md',
    ]);
  });

  it('keeps the default brief and refine templates within the one-screen limit', () => {
    const brief = CHANGE_TEMPLATES.find((t) => t.file === 'brief.md')!;
    const refine = CHANGE_TEMPLATES.find((t) => t.file === 'refine.md')!;
    expect(brief.content.split('\n').length).toBeLessThanOrEqual(40);
    expect(refine.content.split('\n').length).toBeLessThanOrEqual(40);
  });
});
