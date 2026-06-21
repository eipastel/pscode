import { describe, it, expect } from 'vitest';
import { openTarget, launchCommandFor } from '../../src/core/launch';

describe('launch — openTarget', () => {
  it('prioritizes Claude Code when multiple agents are selected', () => {
    expect(openTarget(['gemini', 'codex', 'claude'])).toBe('claude');
  });

  it('falls back to the AGENTS order when Claude is absent', () => {
    expect(openTarget(['gemini', 'codex'])).toBe('codex');
  });

  it('skips Cursor (no launch command) and returns null when it is the only agent', () => {
    expect(openTarget(['cursor'])).toBeNull();
  });

  it('returns null for an empty selection', () => {
    expect(openTarget([])).toBeNull();
  });
});

describe('launch — launchCommandFor', () => {
  it('maps known agents to their CLI command', () => {
    expect(launchCommandFor('claude')).toBe('claude');
    expect(launchCommandFor('gemini')).toBe('gemini');
  });

  it('returns null for agents without a launch command', () => {
    expect(launchCommandFor('cursor')).toBeNull();
  });
});
