import { describe, expect, it } from 'vitest';

import {
  buildNextStepComment,
  buildNextStepReminder,
  getNextStepCommentInstructionBlock,
} from '../../../src/core/templates/workflows/trello-next-step-comment.js';

describe('buildNextStepComment', () => {
  it('pre-fills a simple title as a quoted argument', () => {
    const comment = buildNextStepComment('Minha feature', '/ps:propose');
    expect(comment).toContain('/ps:propose "Minha feature"');
    // Header + description + fenced code block.
    expect(comment).toContain('## Próximo passo');
    expect(comment).toContain('```');
  });

  it('preserves spaces and accents without unnecessary escaping', () => {
    const comment = buildNextStepComment('Comentário de próximo passo', '/ps:apply');
    expect(comment).toContain('/ps:apply "Comentário de próximo passo"');
  });

  it('escapes internal double quotes so the command stays valid', () => {
    const comment = buildNextStepComment('Feature "X" melhorada', '/ps:propose');
    expect(comment).toContain('/ps:propose "Feature \\"X\\" melhorada"');
  });

  it('falls back to the kebab-case change name when the title is empty', () => {
    const comment = buildNextStepComment('', '/ps:propose', 'Minha Feature');
    expect(comment).toContain('/ps:propose "minha-feature"');
  });

  it('falls back when the title is only whitespace', () => {
    const comment = buildNextStepComment('   ', '/ps:apply', 'add-user-auth');
    expect(comment).toContain('/ps:apply "add-user-auth"');
  });

  it('uses a safe placeholder when neither title nor change name is available', () => {
    const comment = buildNextStepComment('', '/ps:propose');
    expect(comment).toContain('/ps:propose "nova-change"');
  });

  it('normalizes a command missing the leading slash', () => {
    const comment = buildNextStepComment('Minha feature', 'ps:complete');
    expect(comment).toContain('/ps:complete "Minha feature"');
  });

  it('is pure: same arguments yield the same result', () => {
    const a = buildNextStepComment('Minha feature', '/ps:apply');
    const b = buildNextStepComment('Minha feature', '/ps:apply');
    expect(a).toBe(b);
  });
});

describe('getNextStepCommentInstructionBlock', () => {
  it('embeds the pre-filled command inside an add_comment tool block', () => {
    const block = getNextStepCommentInstructionBlock('<título do card>', '/ps:apply');
    expect(block).toContain('mcp__claude_ai_Trello_Custom__add_comment');
    expect(block).toContain('/ps:apply "<título do card>"');
    expect(block).toContain('card_id: "<cardId>"');
  });

  it('mentions buildNextStepComment so the format stays centralized', () => {
    const block = getNextStepCommentInstructionBlock('<título do card>', '/ps:propose');
    expect(block).toContain('buildNextStepComment');
    expect(block).toContain('/ps:propose "<título do card>"');
  });

  it('keeps the auxiliary, non-blocking guidance', () => {
    const block = getNextStepCommentInstructionBlock('<título do card>', '/ps:complete');
    expect(block).toContain('auxiliary, never blocking');
  });
});

describe('buildNextStepReminder', () => {
  it('names the placeholder and the command so the argument is never dropped', () => {
    const reminder = buildNextStepReminder('<card title>', '/ps:apply');
    expect(reminder).toContain('<card title>');
    expect(reminder).toContain('/ps:apply');
    expect(reminder).toContain('must always');
  });

  it('normalizes a command missing the leading slash', () => {
    const reminder = buildNextStepReminder('<card title>', 'ps:complete');
    expect(reminder).toContain('/ps:complete');
  });
});
