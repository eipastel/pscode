import { createHash } from 'node:crypto';
import { describe, expect, it, test } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getCompleteChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getPsApplyCommandTemplate,
  getPsCompleteCommandTemplate,
  getPsExploreCommandTemplate,
  getPsProposeCommandTemplate,
  getProposeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getApplyChangeSkillTemplate: 'c5ce88e14875831586cb50e5e24a5a4c8c9994282ecabd6334bcd08b28dcb1bf',
  getCompleteChangeSkillTemplate: '9de7b7b89f3f81ecdbd944e2450d7375fcbe93439bbea4bf6368ee7423503d5d',
  getExploreSkillTemplate: '883766675e50ab0f1e8ddea8d35083523dad24f7358107659d670d4e6569e1cb',
  getFeedbackSkillTemplate: '37cc46fb58f8390f6cb47d4221bfd729ea45692903f19ef5dc932b6a6e04c24a',
  getProposeSkillTemplate: '5ab0ffe2466a2a383cd551f6d47110137926ee3091285bf5a43a09320adc5cf5',
  getPsApplyCommandTemplate: 'a9bde78b28366d2bb76a08a7daf88d7a82c06145eb6e7df59d378e2db082464a',
  getPsCompleteCommandTemplate: '4a1f7c39ec3df780f8c7665fd58d8f2774e29c91c821ea36394345d092d051e5',
  getPsExploreCommandTemplate: 'bfd0f5505ee60d50fb9b7f1ecb3ffa933d801d86136786e78c4fa4f60a1acabe',
  getPsProposeCommandTemplate: '317f6e0c2547864f95c9adc72ecd90b325059b367a740fff7c8777ada05643ea',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'pscode-apply-change': '2eaec08f697edf2e3a1ab20c0cac7d1935639bfcfd70aab80bd589094045594b',
  'pscode-complete-change': '814b331817505a6f2b905b87e8152cd6cb54726e8c69a0b86a65e19eab165587',
  'pscode-explore': 'e99fb2a097f7f6a5d7c2f3f5e8b4f59c8d1f979f971b91613409a3978fe503d3',
  'pscode-propose': 'd8c4c26313b0fd3fa4bfaef81508ed6a846ce11748f047726ae2a022903c0f55',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getApplyChangeSkillTemplate,
      getPsExploreCommandTemplate,
      getPsApplyCommandTemplate,
      getCompleteChangeSkillTemplate,
      getPsCompleteCommandTemplate,
      getProposeSkillTemplate,
      getPsProposeCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['pscode-explore', getExploreSkillTemplate],
      ['pscode-apply-change', getApplyChangeSkillTemplate],
      ['pscode-complete-change', getCompleteChangeSkillTemplate],
      ['pscode-propose', getProposeSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  describe('apply skill PR config integration', () => {
    it('apply skill instructs agent to read pscode/config.yaml', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('pscode/config.yaml');
      expect(content).toContain('pr.enabled: true');
    });

    it('apply skill includes PR disabled fallback instruction', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('pr.enabled: false');
      expect(content).toContain('continue normally without any PR instructions');
    });

    it('apply skill includes branch pattern instruction when PR enabled', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('pr.branch.pattern');
      expect(content).toContain('pr.title.template');
      expect(content).toContain('pr.description.template');
    });
  });

  describe('PR auto-draft integration', () => {
    it('propose skill asks once about opening the draft PR when PR enabled', () => {
      const content = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      expect(content).toContain('pr.enabled: true');
      expect(content).toContain('Quer abrir o Pull Request em DRAFT agora?');
      expect(content).toContain('gh pr create --draft');
    });

    it('propose skill leaves PR opening to apply when user declines or PR disabled', () => {
      const content = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      expect(content).toContain('left to `/ps:apply`');
      expect(content).toContain('PR_OPENED');
    });

    it('apply skill opens a draft PR automatically when none exists', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('open one in **DRAFT automatically, without asking the user**');
      expect(content).toContain('gh pr view --json state');
      expect(content).toContain('gh pr create --draft');
    });

    it('apply skill continues on the existing PR without opening another', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('do NOT open another');
    });

    it('both skills describe non-blocking PR failure handling', () => {
      const proposeContent = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      for (const content of [proposeContent, applyContent]) {
        expect(content).toContain('--draft');
        expect(content).toContain('gh auth login');
        expect(content).toMatch(/do NOT block|não-bloqueante/);
      }
    });

    it('both skills comment the PR link on the tracker when linkInTask is enabled', () => {
      const proposeContent = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      for (const content of [proposeContent, applyContent]) {
        expect(content).toContain('pr.comments.linkInTask: true');
      }
    });
  });

  describe('complete auto sync & archive (no confirmation prompts)', () => {
    // The skill exposes the shared instructions via `.instructions`; the command via `.content`.
    const completeContents: Array<[string, string]> = [
      ['pscode-complete-change skill', getCompleteChangeSkillTemplate().instructions],
      ['ps:complete command', getPsCompleteCommandTemplate().content],
    ];

    it('only uses AskUserQuestion for change selection (Step 1), never to confirm sync/archive', () => {
      for (const [label, content] of completeContents) {
        // Step 1 selection keeps the prompt
        expect(content, label).toContain('Use the **AskUserQuestion tool** to let the user select');
        // No confirmation prompts for incomplete artifacts/tasks or sync
        expect(content, label).toContain('Proceed automatically — do NOT use `AskUserQuestion`');
        expect(content, label).toContain(
          'Never use `AskUserQuestion` to confirm sync or archiving'
        );
        expect(content, label).not.toContain('to confirm user wants to proceed');
      }
    });

    it('syncs delta specs inline without the non-existent pscode-sync-specs skill', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('Sync delta specs into main specs automatically');
        expect(content, label).toContain('perform the merge inline');
        expect(content, label).toContain('there is no `pscode-sync-specs` skill');
        // No subagent delegation to the missing skill
        expect(content, label).not.toContain('invoke pscode-sync-specs');
        expect(content, label).not.toContain('Sync now (recommended)');
      }
    });

    it('records incomplete artifacts/tasks as warnings instead of blocking', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('Record a warning listing the incomplete artifacts');
        expect(content, label).toContain('Record a warning showing the count of incomplete tasks');
        // The "user chose to skip" sync state no longer exists
        expect(content, label).not.toContain('Sync skipped (user chose to skip)');
        expect(content, label).not.toContain('Delta spec sync was skipped');
      }
    });
  });

  it('guards unsupported workspace workflows from repo-local fallback edits', () => {
    const guardedSkills: Array<[string, () => SkillTemplate, string]> = [
      ['pscode-apply-change', getApplyChangeSkillTemplate, 'full workspace apply is not supported'],
      ['pscode-complete-change', getCompleteChangeSkillTemplate, 'workspace archive is not supported'],
    ];

    for (const [dirName, createTemplate, guardText] of guardedSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');

      expect(content, dirName).toContain('actionContext.mode: "workspace-planning"');
      expect(content, dirName).toContain(guardText);
      expect(content, dirName).not.toContain('pscode/changes/<name>');
      expect(content, dirName).not.toContain('mv pscode/changes');
    }
  });
});
