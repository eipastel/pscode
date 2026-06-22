import { describe, it, expect } from 'vitest';
import { applyContentFlags } from '../../src/core/content/flags';
import { getAdapter } from '../../src/core/adapters';
import { COMMANDS } from '../../src/core/content/commands';
import { SKILLS } from '../../src/core/content/skills';

const dev = COMMANDS.find((c) => c.id === 'dev')!;
const devSkill = SKILLS.find((s) => s.name === 'pscode-dev')!;
const githubSync = SKILLS.find((s) => s.name === 'pscode-github-sync')!;

describe('conditional content flags', () => {
  it('keeps {{#pr}} blocks and drops {{^pr}} blocks when the PR flow is on', () => {
    const out = applyContentFlags('a {{#pr}}PR{{/pr}}{{^pr}}no-PR{{/pr}} b', { pr: true });
    expect(out).toBe('a PR b');
  });

  it('drops {{#pr}} blocks and keeps {{^pr}} blocks when the PR flow is off', () => {
    const out = applyContentFlags('a {{#pr}}PR{{/pr}}{{^pr}}no-PR{{/pr}} b', { pr: false });
    expect(out).toBe('a no-PR b');
  });

  it('collapses the blank-line run a removed block leaves behind', () => {
    const out = applyContentFlags('one\n\n{{#pr}}two\n\n{{/pr}}three', { pr: false });
    expect(out).not.toMatch(/\n\n\n/);
    expect(out).toBe('one\n\nthree');
  });

  it('never leaks a marker into rendered output, in either mode', () => {
    const adapter = getAdapter('claude');
    for (const pr of [true, false]) {
      for (const cmd of COMMANDS) {
        expect(adapter.renderCommand(cmd, { pr })).not.toMatch(/\{\{[#^/]?pr\}\}/);
      }
      for (const skill of SKILLS) {
        expect(adapter.renderSkill(skill, { pr })).not.toMatch(/\{\{[#^/]?pr\}\}/);
      }
    }
  });

  it('renders the PR steps only when the PR flow is on', () => {
    const adapter = getAdapter('claude');
    const onDev = adapter.renderCommand(dev, { pr: true });
    const offDev = adapter.renderCommand(dev, { pr: false });
    expect(onDev).toContain('PR as a draft');
    expect(offDev).not.toContain('PR as a draft');
    expect(offDev).toContain('no PR is opened');

    const onSkill = adapter.renderSkill(devSkill, { pr: true });
    const offSkill = adapter.renderSkill(devSkill, { pr: false });
    expect(onSkill).toContain('Ready for Review');
    expect(offSkill).not.toContain('Ready for Review');

    const onSync = adapter.renderSkill(githubSync, { pr: true });
    const offSync = adapter.renderSkill(githubSync, { pr: false });
    expect(onSync).toContain('gh pr create');
    expect(offSync).not.toContain('gh pr create');
    expect(offSync).not.toContain('Never merge the PR');
  });

  it('defaults to the PR flow when no flags are passed', () => {
    const adapter = getAdapter('claude');
    expect(adapter.renderCommand(dev)).toContain('PR as a draft');
  });
});
