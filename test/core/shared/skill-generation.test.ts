import { describe, it, expect } from 'vitest';
import {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
  resolveSkillTransformer,
} from '../../../src/core/shared/skill-generation.js';
import {
  getAskUserQuestionGuidanceBlock,
} from '../../../src/core/templates/workflows/ask-user-question-guidance.js';
import { transformToHyphenCommands } from '../../../src/utils/command-references.js';

describe('skill-generation', () => {
  describe('getSkillTemplates', () => {
    it('should return all 8 skill templates', () => {
      const templates = getSkillTemplates();
      expect(templates).toHaveLength(8);
    });

    it('should have unique directory names', () => {
      const templates = getSkillTemplates();
      const dirNames = templates.map(t => t.dirName);
      const uniqueDirNames = new Set(dirNames);
      expect(uniqueDirNames.size).toBe(templates.length);
    });

    it('should include all expected skills', () => {
      const templates = getSkillTemplates();
      const dirNames = templates.map(t => t.dirName);

      expect(dirNames).toContain('pscode-explore');
      expect(dirNames).toContain('pscode-apply-change');
      expect(dirNames).toContain('pscode-complete-change');
      expect(dirNames).toContain('pscode-propose');
      expect(dirNames).toContain('pscode-board-setup');
      expect(dirNames).toContain('pscode-trello-draft');
      expect(dirNames).toContain('pscode-handoff');
      expect(dirNames).toContain('pscode-grill-me');
      expect(dirNames).not.toContain('pscode-trello-setup');
      expect(dirNames).not.toContain('pscode-archive-change');
      expect(dirNames).not.toContain('pscode-new-change');
    });

    it('should have valid template structure', () => {
      const templates = getSkillTemplates();

      for (const { template, dirName, workflowId } of templates) {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.instructions).toBeTruthy();
        expect(dirName).toBeTruthy();
        expect(workflowId).toBeTruthy();
      }
    });

    it('should have unique workflow IDs', () => {
      const templates = getSkillTemplates();
      const ids = templates.map(t => t.workflowId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(templates.length);
    });

    it('should filter by workflow IDs when provided (grill-me is always included)', () => {
      // grill-me is a skill-only, always-on skill — it is generated regardless of
      // the workflow filter, so a 4-workflow filter yields 4 + grill-me = 5.
      const filtered = getSkillTemplates(['propose', 'explore', 'apply', 'complete']);
      expect(filtered).toHaveLength(5);
      const ids = filtered.map(t => t.workflowId);
      expect(ids).toContain('propose');
      expect(ids).toContain('explore');
      expect(ids).toContain('apply');
      expect(ids).toContain('complete');
      expect(ids).toContain('grill-me');
      expect(ids).not.toContain('new');
      expect(ids).not.toContain('ff');
    });

    it('should return all templates when filter is undefined', () => {
      const all = getSkillTemplates();
      const noFilter = getSkillTemplates(undefined);
      expect(noFilter).toHaveLength(all.length);
    });

    it('should still return the always-on grill-me skill when filter matches no workflow', () => {
      const filtered = getSkillTemplates(['nonexistent']);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].dirName).toBe('pscode-grill-me');
    });

    it('should return the workflow skill plus the always-on grill-me when filter has one workflow', () => {
      const filtered = getSkillTemplates(['propose']);
      expect(filtered).toHaveLength(2);
      const dirNames = filtered.map(t => t.dirName);
      expect(dirNames).toContain('pscode-propose');
      expect(dirNames).toContain('pscode-grill-me');
    });
  });

  describe('getCommandTemplates', () => {
    it('should return all 7 command templates', () => {
      const templates = getCommandTemplates();
      expect(templates).toHaveLength(7);
    });

    it('should have unique IDs', () => {
      const templates = getCommandTemplates();
      const ids = templates.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(templates.length);
    });

    it('should include all expected commands', () => {
      const templates = getCommandTemplates();
      const ids = templates.map(t => t.id);

      expect(ids).toContain('explore');
      expect(ids).toContain('apply');
      expect(ids).toContain('complete');
      expect(ids).toContain('propose');
      expect(ids).toContain('board-setup');
      expect(ids).toContain('draft');
      expect(ids).toContain('handoff');
      // grill-me is skill-only — it must NOT be a command.
      expect(ids).not.toContain('grill-me');
      expect(ids).not.toContain('trello-setup');
      expect(ids).not.toContain('new');
      expect(ids).not.toContain('verify');
    });

    it('should filter by workflow IDs when provided', () => {
      const filtered = getCommandTemplates(['propose', 'explore', 'apply', 'complete']);
      expect(filtered).toHaveLength(4);
      const ids = filtered.map(t => t.id);
      expect(ids).toContain('propose');
      expect(ids).toContain('explore');
      expect(ids).toContain('apply');
      expect(ids).toContain('complete');
      expect(ids).not.toContain('new');
      expect(ids).not.toContain('ff');
    });

    it('should return all templates when filter is undefined', () => {
      const all = getCommandTemplates();
      const noFilter = getCommandTemplates(undefined);
      expect(noFilter).toHaveLength(all.length);
    });

    it('should return empty array when filter matches nothing', () => {
      const filtered = getCommandTemplates(['nonexistent']);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('getCommandContents', () => {
    it('should return all 7 command contents', () => {
      const contents = getCommandContents();
      expect(contents).toHaveLength(7);
    });

    it('should have valid content structure', () => {
      const contents = getCommandContents();

      for (const content of contents) {
        expect(content.id).toBeTruthy();
        expect(content.name).toBeTruthy();
        expect(content.description).toBeTruthy();
        expect(content.body).toBeTruthy();
      }
    });

    it('should have matching IDs with command templates', () => {
      const templates = getCommandTemplates();
      const contents = getCommandContents();

      const templateIds = templates.map(t => t.id).sort();
      const contentIds = contents.map(c => c.id).sort();

      expect(contentIds).toEqual(templateIds);
    });

    it('should filter by workflow IDs when provided', () => {
      const filtered = getCommandContents(['propose', 'explore']);
      expect(filtered).toHaveLength(2);
      const ids = filtered.map(c => c.id);
      expect(ids).toContain('propose');
      expect(ids).toContain('explore');
      expect(ids).not.toContain('new');
    });

    it('should return all contents when filter is undefined', () => {
      const all = getCommandContents();
      const noFilter = getCommandContents(undefined);
      expect(noFilter).toHaveLength(all.length);
    });
  });

  describe('generateSkillContent', () => {
    it('should generate valid YAML frontmatter', () => {
      const template = {
        name: 'test-skill',
        description: 'Test description',
        instructions: 'Test instructions',
        compatibility: 'Test compatibility',
        metadata: {
          author: 'test-author',
          version: '2.0',
        },
      };

      const content = generateSkillContent(template, '0.23.0');

      expect(content).toMatch(/^---\n/);
      expect(content).toContain('name: test-skill');
      expect(content).toContain('description: Test description');
      expect(content).not.toContain('license:');
      expect(content).toContain('compatibility: Test compatibility');
      expect(content).toContain('author: test-author');
      expect(content).toContain('version: "2.0"');
      expect(content).toContain('generatedBy: "0.23.0"');
      expect(content).toContain('Test instructions');
    });

    it('should use default values for optional fields', () => {
      const template = {
        name: 'minimal-skill',
        description: 'Minimal description',
        instructions: 'Minimal instructions',
      };

      const content = generateSkillContent(template, '0.24.0');

      expect(content).not.toContain('license:');
      expect(content).toContain('compatibility: Requires pscode CLI.');
      expect(content).toContain('author: pscode');
      expect(content).toContain('version: "1.0"');
      expect(content).toContain('generatedBy: "0.24.0"');
    });

    it('should embed the provided version in generatedBy field', () => {
      const template = {
        name: 'version-test',
        description: 'Test version embedding',
        instructions: 'Instructions',
      };

      const content1 = generateSkillContent(template, '0.23.0');
      expect(content1).toContain('generatedBy: "0.23.0"');

      const content2 = generateSkillContent(template, '1.0.0');
      expect(content2).toContain('generatedBy: "1.0.0"');

      const content3 = generateSkillContent(template, '0.24.0-beta.1');
      expect(content3).toContain('generatedBy: "0.24.0-beta.1"');
    });

    it('should end frontmatter with separator and blank line', () => {
      const template = {
        name: 'test',
        description: 'Test',
        instructions: 'Body content',
      };

      const content = generateSkillContent(template, '0.23.0');

      expect(content).toMatch(/---\n\nBody content\n$/);
    });

    it('should apply transformInstructions callback when provided', () => {
      const template = {
        name: 'transform-test',
        description: 'Test transform callback',
        instructions: 'Use /ps:new to start and /ps:apply to implement.',
      };

      const transformer = (text: string) => text.replace(/\/ps:/g, '/ps-');
      const content = generateSkillContent(template, '0.23.0', transformer);

      expect(content).toContain('/ps-new');
      expect(content).toContain('/ps-apply');
      expect(content).not.toContain('/ps:new');
      expect(content).not.toContain('/ps:apply');
    });

    it('should not transform instructions when callback is undefined', () => {
      const template = {
        name: 'no-transform-test',
        description: 'Test without transform',
        instructions: 'Use /ps:new to start.',
      };

      const content = generateSkillContent(template, '0.23.0', undefined);

      expect(content).toContain('/ps:new');
    });

    it('should support custom transformInstructions logic', () => {
      const template = {
        name: 'custom-transform',
        description: 'Test custom transform',
        instructions: 'Some PLACEHOLDER text here.',
      };

      const customTransformer = (text: string) => text.replace('PLACEHOLDER', 'REPLACED');
      const content = generateSkillContent(template, '0.23.0', customTransformer);

      expect(content).toContain('Some REPLACED text here.');
      expect(content).not.toContain('PLACEHOLDER');
    });
  });

  describe('resolveSkillTransformer', () => {
    it('returns the hyphen transform for opencode and pi', () => {
      expect(resolveSkillTransformer('opencode')).toBe(transformToHyphenCommands);
      expect(resolveSkillTransformer('pi')).toBe(transformToHyphenCommands);
    });

    it('returns the AskUserQuestion guidance transform for claude', () => {
      const transformer = resolveSkillTransformer('claude');
      expect(transformer).toBeDefined();
      expect(transformer!('Body.')).toContain(getAskUserQuestionGuidanceBlock());
    });

    it('returns undefined for tools without a transform', () => {
      for (const tool of ['cursor', 'codex', 'gemini', 'github-copilot']) {
        expect(resolveSkillTransformer(tool)).toBeUndefined();
      }
    });

    it('injects the guidance block into claude skills only', () => {
      const block = getAskUserQuestionGuidanceBlock();
      const templates = getSkillTemplates();

      for (const { template } of templates) {
        const claudeContent = generateSkillContent(
          template,
          'TEST',
          resolveSkillTransformer('claude')
        );
        expect(claudeContent).toContain(block);

        for (const tool of ['cursor', 'codex', 'gemini', 'github-copilot']) {
          const otherContent = generateSkillContent(
            template,
            'TEST',
            resolveSkillTransformer(tool)
          );
          expect(otherContent, `${template.name} for ${tool}`).not.toContain(block);
        }
      }
    });

    it('is idempotent — regenerating a claude skill keeps exactly one block', () => {
      const heading = '## Asking the user';
      const template = getSkillTemplates()[0].template;
      const transformer = resolveSkillTransformer('claude')!;

      const once = generateSkillContent(template, 'TEST', transformer);
      // Simulate `update` running the transform over already-transformed instructions
      const reTransformed = transformer(transformer(template.instructions));
      const occurrences = reTransformed.split(heading).length - 1;
      expect(occurrences).toBe(1);
      expect(once.split(heading).length - 1).toBe(1);
    });

    it('emits a byte-identical guidance block across all claude skills', () => {
      const block = getAskUserQuestionGuidanceBlock();
      const transformer = resolveSkillTransformer('claude')!;

      for (const { template } of getSkillTemplates()) {
        const content = generateSkillContent(template, 'TEST', transformer);
        // Exactly one occurrence and it matches the canonical block byte-for-byte
        expect(content.split(block).length - 1).toBe(1);
      }
    });
  });
});
