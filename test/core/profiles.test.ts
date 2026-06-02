import { describe, it, expect } from 'vitest';

import {
  ALL_WORKFLOWS,
  PROFILES,
  getProfileWorkflows,
  isValidProfile,
  DEFAULT_PROFILE,
} from '../../src/core/profiles.js';

describe('profiles', () => {
  describe('ALL_WORKFLOWS', () => {
    it('should contain all 8 workflows', () => {
      expect(ALL_WORKFLOWS).toHaveLength(8);
    });

    it('should contain expected workflow IDs', () => {
      const expected = [
        'propose', 'explore', 'apply', 'complete',
        'trello-setup', 'draft', 'handoff', 'grill-me',
      ];
      expect([...ALL_WORKFLOWS]).toEqual(expected);
    });

    it('should not contain the removed sync workflow', () => {
      expect(ALL_WORKFLOWS).not.toContain('sync');
    });

    it('should not contain the removed orphan workflow IDs', () => {
      const removed = ['new', 'continue', 'ff', 'bulk-archive', 'verify', 'onboard', 'rfc', 'design', 'tasks', 'arch-check', 'adr', 'jira-sync', 'dod'];
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

    it('standard profile should contain the base workflows including trello', () => {
      expect([...PROFILES.standard.workflows]).toEqual(['propose', 'explore', 'apply', 'complete', 'trello-setup', 'draft', 'handoff', 'grill-me']);
    });

    it('standard profile should not contain sync', () => {
      expect(PROFILES.standard.workflows).not.toContain('sync');
    });

    it('dixi profile should be JIRA-native — no trello-setup workflow', () => {
      expect(PROFILES.dixi.workflows).not.toContain('trello-setup');
    });

    it('dixi profile should still keep draft and the core workflows', () => {
      expect([...PROFILES.dixi.workflows]).toEqual(['propose', 'explore', 'apply', 'complete', 'draft', 'handoff', 'grill-me']);
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
});
