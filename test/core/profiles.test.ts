import { describe, it, expect } from 'vitest';

import {
  ALL_WORKFLOWS,
  PROFILES,
  getProfileWorkflows,
  isValidProfile,
  DEFAULT_PROFILE,
  inferProfileFromSchema,
  resolveProfile,
} from '../../src/core/profiles.js';

describe('profiles', () => {
  describe('ALL_WORKFLOWS', () => {
    it('should contain all 7 workflows', () => {
      expect(ALL_WORKFLOWS).toHaveLength(7);
    });

    it('should contain expected workflow IDs', () => {
      const expected = [
        'propose', 'explore', 'apply', 'complete',
        'board-setup', 'draft', 'handoff',
      ];
      expect([...ALL_WORKFLOWS]).toEqual(expected);
    });

    it('should not contain the removed sync workflow', () => {
      expect(ALL_WORKFLOWS).not.toContain('sync');
    });

    it('should not contain trello-setup (renamed to board-setup) or grill-me (now skill-only)', () => {
      expect(ALL_WORKFLOWS).not.toContain('trello-setup');
      expect(ALL_WORKFLOWS).not.toContain('grill-me');
    });

    it('should not contain the removed orphan workflow IDs', () => {
      const removed = ['new', 'continue', 'ff', 'bulk-archive', 'verify', 'onboard', 'rfc', 'design', 'tasks', 'arch-check', 'adr', 'jira-sync', 'dod', 'jira-setup'];
      for (const id of removed) {
        expect(ALL_WORKFLOWS).not.toContain(id);
      }
    });
  });

  describe('PROFILES', () => {
    it('should define standard and dixi profiles', () => {
      expect(PROFILES).toHaveProperty('standard');
      expect(PROFILES).toHaveProperty('dixi');
    });

    it('each profile should have a description and non-empty workflows list', () => {
      for (const [name, def] of Object.entries(PROFILES)) {
        expect(def.description, `${name}.description`).toBeTruthy();
        expect(def.workflows.length, `${name}.workflows`).toBeGreaterThan(0);
      }
    });

    const UNIFIED = ['propose', 'explore', 'apply', 'complete', 'draft', 'handoff', 'board-setup'];

    it('standard profile should contain the unified workflow list', () => {
      expect([...PROFILES.standard.workflows]).toEqual(UNIFIED);
    });

    it('standard profile should not contain sync', () => {
      expect(PROFILES.standard.workflows).not.toContain('sync');
    });

    it('dixi profile should have the same unified workflow list as standard', () => {
      expect([...PROFILES.dixi.workflows]).toEqual([...PROFILES.standard.workflows]);
    });

    it('both profiles use board-setup (not trello-setup) and never grill-me', () => {
      for (const def of Object.values(PROFILES)) {
        expect(def.workflows).toContain('board-setup');
        expect(def.workflows).not.toContain('trello-setup');
        expect(def.workflows).not.toContain('grill-me');
      }
    });

    it('dixi profile should keep the unified workflow list', () => {
      expect([...PROFILES.dixi.workflows]).toEqual(UNIFIED);
    });

    it('all profile workflows should be valid workflow IDs', () => {
      for (const [name, def] of Object.entries(PROFILES)) {
        for (const workflow of def.workflows) {
          expect(ALL_WORKFLOWS, `${name} has unknown workflow "${workflow}"`).toContain(workflow);
        }
      }
    });
  });

  describe('getProfileWorkflows', () => {
    it('should return the workflows for the standard profile', () => {
      const result = getProfileWorkflows('standard');
      expect([...result]).toEqual([...PROFILES.standard.workflows]);
    });

    it('should return the workflows for the dixi profile', () => {
      const result = getProfileWorkflows('dixi');
      expect([...result]).toEqual([...PROFILES.dixi.workflows]);
    });
  });

  describe('isValidProfile', () => {
    it('returns true for defined profile names', () => {
      expect(isValidProfile('standard')).toBe(true);
      expect(isValidProfile('dixi')).toBe(true);
    });

    it('returns false for unknown names', () => {
      expect(isValidProfile('core')).toBe(false);
      expect(isValidProfile('custom')).toBe(false);
      expect(isValidProfile('')).toBe(false);
      expect(isValidProfile('unknown')).toBe(false);
    });
  });

  describe('DEFAULT_PROFILE', () => {
    it('should be a valid profile', () => {
      expect(isValidProfile(DEFAULT_PROFILE)).toBe(true);
    });
  });

  describe('inferProfileFromSchema', () => {
    it('maps the dixi-workflow schema to the dixi profile', () => {
      expect(inferProfileFromSchema('dixi-workflow')).toBe('dixi');
    });

    it('maps the legacy pstld-workflow schema (alias) to the dixi profile', () => {
      expect(inferProfileFromSchema('pstld-workflow')).toBe('dixi');
    });

    it('returns null for the default schema', () => {
      expect(inferProfileFromSchema('spec-driven')).toBeNull();
    });

    it('returns null when schema is undefined', () => {
      expect(inferProfileFromSchema(undefined)).toBeNull();
    });
  });

  describe('resolveProfile', () => {
    it('prefers an explicit override above everything else', () => {
      expect(
        resolveProfile({
          override: 'standard',
          projectProfile: 'dixi',
          projectSchema: 'pstld-workflow',
          globalProfile: 'dixi',
        })
      ).toBe('standard');
    });

    it('uses the project profile when there is no override', () => {
      expect(
        resolveProfile({ projectProfile: 'dixi', globalProfile: 'standard' })
      ).toBe('dixi');
    });

    it('infers dixi from the schema when no explicit profile is stored', () => {
      expect(
        resolveProfile({ projectSchema: 'pstld-workflow', globalProfile: 'standard' })
      ).toBe('dixi');
    });

    it('falls back to the global profile when the project has no profile/schema signal', () => {
      expect(
        resolveProfile({ projectSchema: 'spec-driven', globalProfile: 'dixi' })
      ).toBe('dixi');
    });

    it('falls back to DEFAULT_PROFILE when nothing resolves', () => {
      expect(resolveProfile({})).toBe(DEFAULT_PROFILE);
    });

    it('ignores invalid override/project/global values', () => {
      expect(
        resolveProfile({
          override: 'bogus',
          projectProfile: 'nope',
          projectSchema: 'spec-driven',
          globalProfile: 'also-bad',
        })
      ).toBe(DEFAULT_PROFILE);
    });
  });
});
