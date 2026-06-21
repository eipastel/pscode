import { describe, it, expect } from 'vitest';
import { COMMANDS } from '../../src/core/content/commands';
import { SKILLS } from '../../src/core/content/skills';
import { CHANGE_TEMPLATES } from '../../src/core/content/change-templates';

describe('guided-SDD content', () => {
  it('ships the eight guided slash commands', () => {
    expect(COMMANDS.map((c) => c.id)).toEqual([
      'draft',
      'grill',
      'spec',
      'design',
      'tasks',
      'apply-one',
      'review',
      'done',
    ]);
    for (const cmd of COMMANDS) {
      expect(cmd.body.trim().length).toBeGreaterThan(0);
      expect(cmd.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('ships the four skills', () => {
    expect(SKILLS.map((s) => s.name)).toEqual([
      'pscode-guided-sdd',
      'pscode-grill-me',
      'pscode-mini-spec',
      'pscode-task-runner',
    ]);
    for (const skill of SKILLS) {
      expect(skill.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('ships the five short change templates', () => {
    expect(CHANGE_TEMPLATES.map((t) => t.file)).toEqual([
      'brief.md',
      'questions.md',
      'design.md',
      'tasks.md',
      'review.md',
    ]);
  });

  it('keeps the default brief and design templates within the one-screen limits', () => {
    const brief = CHANGE_TEMPLATES.find((t) => t.file === 'brief.md')!;
    const design = CHANGE_TEMPLATES.find((t) => t.file === 'design.md')!;
    expect(brief.content.split('\n').length).toBeLessThanOrEqual(40);
    expect(design.content.split('\n').length).toBeLessThanOrEqual(30);
  });
});
