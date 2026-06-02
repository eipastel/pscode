import { describe, it, expect } from 'vitest';
import {
  getAskUserQuestionGuidanceBlock,
  prependAskUserQuestionGuidance,
} from '../../../../src/core/templates/workflows/ask-user-question-guidance.js';

describe('ask-user-question-guidance', () => {
  describe('getAskUserQuestionGuidanceBlock', () => {
    it('references AskUserQuestion and the free-text "Other" option', () => {
      const block = getAskUserQuestionGuidanceBlock();
      expect(block).toContain('AskUserQuestion');
      expect(block).toContain('"Other"');
    });

    it('returns the same text on every call (stable source of truth)', () => {
      expect(getAskUserQuestionGuidanceBlock()).toBe(getAskUserQuestionGuidanceBlock());
    });
  });

  describe('prependAskUserQuestionGuidance', () => {
    it('prepends the block before the original instructions', () => {
      const result = prependAskUserQuestionGuidance('Original instructions.');
      expect(result.startsWith(getAskUserQuestionGuidanceBlock())).toBe(true);
      expect(result).toContain('Original instructions.');
    });

    it('is idempotent — applying twice keeps exactly one block', () => {
      const once = prependAskUserQuestionGuidance('Body.');
      const twice = prependAskUserQuestionGuidance(once);
      expect(twice).toBe(once);

      const heading = '## Asking the user';
      const occurrences = twice.split(heading).length - 1;
      expect(occurrences).toBe(1);
    });
  });
});
